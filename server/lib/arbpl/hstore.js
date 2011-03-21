/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at:
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Mozilla Messaging Code.
 *
 * The Initial Developer of the Original Code is
 *   The Mozilla Foundation
 * Portions created by the Initial Developer are Copyright (C) 2011
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Andrew Sutherland <asutherland@asutherland.org>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

/**
 * HBase interaction.
 **/

define(
  [
    "thrift", "hbase-thrift/Hbase", "hbase-thrift/Hbase_types",
    "q",
    "exports"
  ],
  function(
    $thrift, $thriftHbase, $baseTypes,
    $Q,
    exports
  ) {
var when = $Q.when;

var TABLE_PUSH_FOCUSED = "arbpl_pushy";

// mozilla-central is currently at ~20000
var BIG_PUSH_NUMBER = 9999999;
var PUSH_DIGIT_COUNT = 7;
var ZEROES = "0000000";
var NINES  = "9999999";

function transformPushId(pushId) {
  pushId = parseInt(pushId);
  var nonpaddedString = (BIG_PUSH_NUMBER - pushId) + "";
  return ZEROES.substring(nonpaddedString.length) + nonpaddedString;
}

/**
 * Push-centric table representation.
 *
 * Key is [tree identifier, (BIG NUMBER - push number)].
 *
 * We use a BIG NUMBER less the push number because scans can only scan in a
 *  lexically increasing direction and we want our scans to always go backwards
 *  in time.  This enables us to easily find the most recent push by seeking to
 *  [tree identifier, all zeroes].
 *
 * Column family "s" is used for overview data, and stands for summary.  It is
 *  further sub-divided like so:
 * - "r": Stores the push info and changeset information for this push for the
 *    root repo.
 * - "r:PUSHID": Stores the push and changeset information for sub-repo pushes.
 * - "b:(PUSHID:)BUILDID": Stores the build info scraped from the tinderbox
 *    without augmentation.  In the event of a complex tree (ex: comm-central)
 *    we include the push id of the sub-repo used to perform the build.  This
 *    information can change and be updated it the build status progresses or
 *    the note changes because of starring or what not.
 * - "l:(PUSHID:)BUILDID": Stores summary information derived from processing
 *    the build log for information.  Voluminous data is stored in the "d"
 *    column using the same column name (but prefixed with "d" instead of "s").
 *    The presence of voluminous data is conveyed by setting the "hasDetails"
 *    attribute to true rather than false.
 *
 *
 * Column family "d" is used for detailed run information.  We separate the
 *  data out from the summary data because we do not expect that everyone
 *  looking at the pushlog is actually going to investigate the failures in
 *  detail.  We keep everything in the same row primarily for compression
 *  reasons; for true error failures, we expect to see basically the same
 *  failure across multiple builders in the same row.  In practice, we expect
 *  the log fetching to happen on a per-cell basis because you can only
 *  focus on so much stuff at once.  (The UI is free to pre-fetch or request
 *  multiple cells for comparison, of course.)
 *
 * It is definitely worth considering an alternate arrangement where the row
 *  is specific to a specific builder run and the columns are the failed tests
 *  within the run.  We would do this to be able to address individual test
 *  failures in the case the data becomes too voluminous on a per-log basis.
 *
 * Subdivison is:
 * - "l:(PUSHID:)BUILDID": The details corresponding to the same (apart from
 *    the prefix) column from the summary column family.  Only present when
 *    the "hasDetails" attribute is true in the summary.
 */
var TDEF_PUSH_FOCUSED = {
  name: TABLE_PUSH_FOCUSED,
  columnFamilies: [
    new $baseTypes.ColumnDescriptor({
      name: "s",
      maxVersions: 1,
      // it does not like compression: RECORD and the javadoc says the option
      //  is deprecated, although jerks do not mention what it is deprecated
      //  in favor of...
      bloomFilterType: "ROW",
      blockCacheEnabled: 1,
    }),
    new $baseTypes.ColumnDescriptor({
      name: "d",
      maxVersions: 1,
      // it does not like compression: RECORD and the javadoc says the option
      //  is deprecated, although jerks do not mention what it is deprecated
      //  in favor of...
      bloomFilterType: "ROW",
      blockCacheEnabled: 1,
    }),
  ]
};

var TABLE_FAIL_ANALYTIC = "arbpl_faily";

/**
 * Failure analytic table.
 *
 * Key is [tree identifier, day number].
 *
 * Column family "t" is used for tally data.  The column name is composed like
 *  so: [test type, ":", test path, ":", signature (can be "")].  The value
 *  is an atomic count thing.
 *
 * Column family "x" is used for cross-reference data.  The column name is
 *  the same column name as the "t" column for the failure, but with
 *  ":(PUSHID:)BUILDID" appended.  The value is the JSON builder so that
 *  the set of failures can be post-processed.
 */
var TDEF_FAIL_ANALYTIC = {
};

/**
 * Map revisions to the push they correspond to.  We could alternatively require
 *  requesters to just bounce things off of the hg repo which has this mapping
 *  (at least until the try server repo gets nuked).
 */
var TDEF_REV_TO_PUSH = {
};

var SCHEMA_TABLES = [
  TDEF_PUSH_FOCUSED,
];

/**
 * @args[
 *   @param[opcode @oneof["recent" "pushSummary" "logDetail" "putPush"]]
 *   @param[treeId String]
 *   @param[pushId Number]
 *   @param[buildId String]{
 *     The build id string, if relevant, or an empty string otherwise.
 *   }
 * ]
 */
function DBReadOp(opcode, treeId, pushId, buildId) {
  this.opcode = opcode;
  this.treeId = treeId;
  this.pushId = pushId;
  this.buildId = buildId;

  // should be set only after verifying the op does not already exist!
  this.deferred = null;

  this.hash = treeId + "-" + opcode + "-" + pushId + "-" + buildId;
}
DBReadOp.prototype = {
};

function DBWriteOp(opcode, treeId, pushId, keysAndValues) {
  this.opcode = opcode;
  this.treeId = treeId;
  this.pushId = pushId;
  this.keysAndValues = keysAndValues;
}
DBWriteOp.prototype = {
};

/**
 * HBase datastore abstraction built using promises.  All requests result in
 *  a promise.  We serialize requests into a queue, but also utilize a hash
 *  so that if an already pending request is received we can just provide the
 *  promise for the already pending/outstanding request.
 *
 * Clients must not assume requests will be answered in the same order they are
 *  issued because of request consolidation and the potential that we may use
 *  multiple concurrent connections.
 */
function HStore() {
  /**
   * Ordered list of the pending database operations requested.
   */
  this._dbOpsList = [];
  /**
   * @dictof[
   *   @key["DBOp hash"]{
   *     Concatenation of the treeId, op, and pushId for the db operation.
   *   }
   *   @value[DBOp]
   * ]{
   *   Maps pending DB operations from a hash of their query characteristics
   *   so that if someone wants to issue a query that is already pending, we
   *   can just add their subscription to the list.
   * }
   */
  this._dbOpsMap = {};

  this._ensuringUnderway = false;
  this.bootstrapped = false;
  this._iNextTableSchema = 0;

  this._bootstrapDeferred = $Q.defer();

  this._connect();
}
HStore.prototype = {
  _connect: function() {
    console.log("opening thrift connection");
    this.state = "connecting";

    this._connection = $thrift.createConnection("localhost", 9090);
    this._client = $thrift.createClient($thriftHbase, this._connection);

    this._connection.on("connect", this._onConnect.bind(this));
    this._connection.on("close", this._onClose.bind(this));
    this._connection.on("timeout", this._onTimeout.bind(this));
    this._connection.on("error", this._errConnection.bind(this));
  },

  /**
   * re-establish our connection on-demand.
   */
  get client() {
    if (!this._client)
      this._connect();
    return this._client;
  },

  _onConnect: function() {
    this.state = "connected";
    //this._ensureSchema();
  },
  _onClose: function() {
    console.warn("thrift connection closed!");
    this._connection = null;
    this._client = null;
    this._ensuringUnderway = false;
  },
  _onTimeout: function() {
    console.warn("thrift connection timed out!");
    this._connection = null;
    this._client = null;
    this._ensuringUnderway = false;
  },
  _errConnection: function(err) {
    console.error(err, err.stack);
    this._connection = null;
    this._client = null;
    this._ensuringUnderway = false;
  },

  _ensureSchema: function() {
    console.log("_ensureSchema", this._iNextTableSchema);
    var schema = SCHEMA_TABLES[this._iNextTableSchema++];
    var self = this;
    this.client.createTable(
      schema.name,
      schema.columnFamilies,
      function(err) {
        console.log("_ensureSchema callback", err);
        // We don't care if there is an error right now; we are striving for
        //  idempotency and this gets us that.

        // If we are all done, resolve.
        if (self._iNextTableSchema >= SCHEMA_TABLES.length) {
          console.log("resolving db bootstrap");
          self._bootstrapDeferred.resolve();
          return;
        }

        self._ensureSchema();
      });
  },

  bootstrap: function() {
    if (!this.bootstrapped && !this._ensuringUnderway) {
      this._iNextTableSchema = 0;
      this._ensureSchema();
      this._ensuringUnderway = true;
    }
    return this._bootstrapDeferred.promise;
  },

  _scheduleOp: function(op) {
    op.deferred = $Q.defer();
    // only read ops can be reused so only they should be mapped
    if (op instanceof DBReadOp)
      this._dbOpsMap[op.hash] = op;
    this._dbOpsList.push(op);
    if (this._dbOpsList.length === 1)
      this._processNextOp();
  },

  _processNextOp: function() {
    if (!this._dbOpsList.length)
      return;
    var op = this._dbOpsList[0];
    var truePromise;
    // The opcode names are decoupled from the functions; not ideal but probably
    //  better than sticking direct function references or always performing
    //  dynamic lookup.  I'm not wedded to this.
    switch (op.opcode) {
      case "recent":
        truePromise = this._getMostRecentKnownPush(op.treeId);
        break;
      case "pushSummary":
        truePromise = this._getPushInfo(op.treeId, op.pushId);
        break;
      case "logDetail":
        truePromise = this._getPushLogDetail(op.treeId, op.pushId, op.buildId);
        break;

      case "putPush":
        truePromise = this._putPushStuff(op.treeId, op.pushId, op.keysAndValues);
        break;
    }
    var self = this;
    function finished() {
      // it has been prosecuted, remove.
      self._dbOpsList.shift();
      // only read ops are mapped because only they can be reused.
      if (op instanceof DBReadOp)
        delete self._dbOpsMap[op.hash];
      self._processNextOp();
    }
    when(truePromise,
      function(result) {
        op.deferred.resolve(result);
        finished();
      },
      function(err) {
        op.deferred.reject(err);
        finished();
      }
    );
  },

  getMostRecentKnownPush: function(treeId) {
    var op = new DBReadOp("recent", treeId, 0, "");
    if (this._dbOpsMap.hasOwnProperty(op.hash)) {
      return this._dbOpsMap[op.hash].deferred.promise;
    }
    this._scheduleOp(op);
    return op.deferred.promise;
  },

  getPushInfo: function(treeId, pushId) {
    var op = new DBReadOp("pushSummary", treeId, pushId, "");
    if (this._dbOpsMap.hasOwnProperty(op.hash)) {
      return this._dbOpsMap[op.has].deferred.promise;
    }
    this._scheduleOp(op);
    return op.deferred.promise;
  },

  getPushLogDetail: function(treeId, pushId, buildId) {
    var op = new DBReadOp("logDetail", treeId, pushId, buildId);
    if (this._dbOpsMap.hasOwnProperty(op.hash)) {
      return this._dbOpsMap[op.has].deferred.promise;
    }
    this._scheduleOp(op);
    return op.deferred.promise;
  },

  putPushStuff: function(treeId, pushId, keysAndValues) {
    var op = new DBWriteOp("putPush", treeId, pushId, keysAndValues);
    this._scheduleOp(op);
    return op.deferred.promise;
  },

  _getMostRecentKnownPush: function(treeId) {
    //console.log("getMostRecentKnownPush...", treeId);
    var deferred = $Q.defer();
    var self = this;
    this.client.scannerOpenWithStop(
      TABLE_PUSH_FOCUSED,
      treeId + "," + ZEROES,
      // we need to specify the stop row to stop from reading into the next
      //  tree's data!
      treeId + "," + NINES,
      ["s"],
      function(err, scannerId) {
        if (err) {
          console.error("Failed to get scanner for most recent on tree",
                        treeId);
          deferred.reject(err);
        }
        else {
          self.client.scannerGetList(
            scannerId, /* count */ 1,
            function(err, rowResults) {
              self.client.scannerClose(scannerId);
              if (err)
                deferred.reject(err);
              else
                deferred.resolve(rowResults);
            });
        }
      });
    return deferred.promise;
  },

  _getPushInfo: function(treeId, pushId) {
    var deferred = $Q.defer();
    this.client.getRowWithColumns(
      TABLE_PUSH_FOCUSED, treeId + "," + transformPushId(pushId),
      ["s"],
      function(err, rowResults) {
        if (err) {
          console.error("Unhappiness getting row: " +
                        treeId + "," + transformPushId(pushId));
          deferred.reject(err);
        }
        else {
          deferred.resolve(rowResults);
        }
      });
    return deferred.promise;
  },

  _getPushLogDetail: function(treeId, pushId, buildId) {
    var deferred = $Q.defer();
    this.client.get(
      TABLE_PUSH_FOCUSED, treeId + "," + transformPushId(pushId),
      "d:l:" + buildId,
      function(err, cells) {
        if (err) {
          console.error("Unhappiness getting cell: " +
                        treeId + "," + transformPushId(pushId) +
                        " row: " + "d:l:" + buildId,
                        err);
          deferred.reject(err);
        }
        else {
          deferred.resolve(JSON.parse(cells[0].value));
        }
      });
    return deferred.promise;
  },

  normalizeOneRow: function(rowResults) {
    var rowStates = this.normalizeRowResults(rowResults);
    if (rowStates.length)
      return rowStates[0];
    return {};
  },

  normalizeRowResults: function(rowResults) {
    var rowStates = [];
    for (var iRow = 0; iRow < rowResults.length; iRow++) {
      var dbstate = {};
      rowStates.push(dbstate);
      var rr = rowResults[iRow];

      var cols = rr.columns;
      for (var key in cols) {
        var value = cols[key].value; // also knows timestamp

        try {
          dbstate[key] = JSON.parse(value);
        }
        catch (ex) {
          console.error("Exception JSON parsing", value);
        }
      }
    }

    return rowStates;
  },

  _putPushStuff: function(treeId, pushId, keysAndValues) {
    if (pushId == null) {
      console.error("Attempted to write with a gibberish push id", pushId);
      throw new Error("bad push id: " + pushId);
    }

    var deferred = $Q.defer();
    var mutations = [];
    for (var key in keysAndValues) {
      var value = keysAndValues[key];
      mutations.push(new $baseTypes.Mutation({
        column: key,
        value: JSON.stringify(value),
      }));
    }

    this.client.mutateRow(
      TABLE_PUSH_FOCUSED, treeId + "," + transformPushId(pushId),
      mutations,
      function(err) {
        if (err) {
          console.error("Problem saving row: " +
                        treeId + "," + transformPushId(pushId));
          deferred.reject(err);
        }
        else {
          deferred.resolve();
        }
      });
    return deferred.promise;
  },
};
exports.HStore = HStore;

}); // end define
