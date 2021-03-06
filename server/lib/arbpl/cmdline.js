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


require(
  {
    baseUrl: "../../",
    packages: [
    ],
    paths: {
      arbpl: "server/lib/arbpl",
      arbcommon: "client/lib/arbcommon",
    },
  },
  [
    "nomnom",
    "q",
    "arbpl/hackjobs",
    "require"
  ],
  function(
    $nomnom,
    $Q,
    $hackjobs,
    $require
  ) {
var when = $Q.when;

var DEATH_PRONE = false;

process.on("uncaughtException",
  function(err) {
    console.log("==== UNCAUGHT ====");
    console.error(err.stack);
    if (DEATH_PRONE)
      process.exit(1);
  });

/**
 * Although our cron jobs happen every 3 minutes right now, let's time-out
 *  after 10 minutes since we aren't a proper inactivity/watchdog timeout.
 */
var WATCHDOG_TIMEOUT = 6 * 60 * 1000;
function deathClock() {
  DEATH_PRONE = true;
  setTimeout(function() {
    console.log("WATCHDOG KILLIN");
    process.exit(10);
  }, WATCHDOG_TIMEOUT);
}

var OPTS = [
  {
    name: "command",
    position: 0,
    help: "one of: sync, web, localchew, backfill",
  },
  {
    name: "bridge-port",
    string: "--bridge-port",
    default: 8009,
  },
  {
    name: "tree",
    string: "--tree=TREE",
  },
];

// We need to do our own argv slicing to compensate for RequireJS' r.js
var options = $nomnom.parseArgs(OPTS, null, process.argv.slice(3));
switch (options.command) {
  case "web":
    $require(
      ["arbpl/web/gogogo"],
      function($webgo) {
        // automatically goes, as it were.
      }
    );
    break;

  case "sync":
    deathClock();
    $require(
      ["arbpl/hivemind"],
      function($hivemind) {
        $hivemind.HIVE_MIND.configure({
          bridgePort: parseInt(options["bridge-port"]),
          tree: options.tree,
        });
        when($hivemind.HIVE_MIND.syncAll(),
          function() {
            console.log("synchronized everyone! woo!");
            process.exit(0);
          },
          function() {
            console.error("suspiciously impossible failure!");
          });
      }
    );
    break;

  case "backfill":
    $require(
      ["arbpl/hivemind"],
      function($hivemind) {
        $hivemind.HIVE_MIND.configure({
          bridgePort: parseInt(options["bridge-port"]),
          tree: options.tree,
        });
        when($hivemind.HIVE_MIND.backfillAll(5),
          function() {
            console.log("synchronized everyone! woo!");
            process.exit(0);
          },
          function() {
            console.error("suspiciously impossible failure!");
          });
      }
    );
    break;

  // test function to push something to the clients using console.log.
  case "testpush":
    $require(
      ["arbpl/databus"],
      function($databus) {
        console.log("creating data bridge");
        var sink = new $databus.ScraperBridgeSource(8009);
        console.log("sending message");
        when(sink.send({type: "test", message: "do it."}),
          function(rstr) {
            console.log("message sent");
            console.log("response body was:", rstr);
            process.exit(0);
          },
          function(errstr) {
            console.error("problem sending message", errstr);
          });
      }
    );
    break;


  case "localchew":
    $require(
      ["arbpl/localchew"],
      function($localchew) {
        var chewer = new $localchew.LocalChewer();
        when(chewer.chew(options[1]),
          function(pushId) {
            console.log("chewed log as push id:", pushId);
            process.exit(0);
          });
      }
    );
    break;

  case "frob-xpcshell":
    $require(
      ["arbpl/xpcshell-logfrob"],
      function($frobber) {
        $frobber.dummyTestRun($hackjobs.gimmeStreamForThing(options[1]));
      }
    );
    break;

  case "frob-mochitest":
    $require(
      ["arbpl/mochitest-logfrob"],
      function($frobber) {
        $frobber.dummyTestRun($hackjobs.gimmeStreamForThing(options[1]));
      }
    );
    break;

  case "frob-reftest":
    $require(
      ["arbpl/reftest-logfrob"],
      function($frobber) {
        $frobber.dummyTestRun($hackjobs.gimmeStreamForThing(options[1]));
      }
    );
    break;

  case "frob-mozmill":
    $require(
      ["arbpl/mozmill-logfrob"],
      function($frobber) {
        $frobber.dummyTestRun($hackjobs.gimmeStreamForThing(options[1]));
      }
    );
    break;

  default:
    console.error("unknown command: " + options.command);
    process.exit(-1);
    break;
}


});
