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

define(
  [
    "fs", "buffer", "http",
    "q",
    "connect", "express",
    "socket.io",
    "../hstore",
    "arbcommon/repodefs",
    "../databus",
    "../datastore",
  ],
  function(
    $fs, $buffer, $http,
    $Q,
    $connect, $express,
    $io,
    // us
    $hstore,
    $repodefs,
    $databus,
    $datastore
  ) {
var when = $Q.when;
var $connectUtils = $connect.utils;

// importante: this is only for log fetching.
var DB = new $hstore.HStore();
var app = $express.createServer();

var LISTEN_PORT = 8008;

var RECENT_PUSHES_CACHE_DURATION_MS = 60 * 1000;

app.configure("development", function() {
  console.log("cur dir", process.cwd());
  app.use($express.static(process.cwd() + "/../../client"));
  LISTEN_PORT = 8008;
  RECENT_PUSHES_CACHE_DURATION_MS = 1 * 1000;
});

/**
 * Given that we only serve two files and do proper "hey, not modified"
 *  handling, let's have people check at least once an hour for changes.
 */
var STATIC_MAX_AGE_SECS = 60 * 60;

/**
 * Return static files served via gzip.  Because we serve so few static files,
 *  we load their contents into buffers at startup and just send them as
 *  requested.  There is no need to check for updated files because any change
 *  to the client files likely entails a change to the server logic and so we
 *  need to be restarted anyways.
 *
 * We leverage a lot of connect's utils mechanics so that we can respond
 *  to conditional gets correctly.
 */
function gzippyFile(bindPath, diskPath, mimeType) {
  // read the file synchronously because why not?
  var stats = $fs.statSync(diskPath);
  var buffer = new $buffer.Buffer(stats.size);
  var fd = $fs.openSync(diskPath, "r");
  if ($fs.readSync(fd, buffer, 0, stats.size, null) != stats.size)
    throw new Error("Incomplete read of " + diskPath);
  $fs.closeSync(fd);

  app.get(bindPath, function(req, res) {
    var acceptEncoding = req.header("Accept-Encoding");
    if (!acceptEncoding || acceptEncoding.indexOf("gzip")) {
      // A web browser that does not support gzip encoding is not going to
      //  be able to run our awesome software!
      res.send(406);
      return;
    }

    // connectUtils' modified checker uses the headers, so set them...
    res.setHeader("Content-Length", stats.size);
    res.setHeader("Cache-Control", "public, max-age=" + STATIC_MAX_AGE_SECS);
    res.setHeader("Last-Modified", stats.mtime.toUTCString());
    // (this is based on file size and timestamp rather than a hash)
    res.setHeader("ETag", $connectUtils.etag(stats));

    // bail if we're already good
    if ($connectUtils.conditionalGET(req) &&
        !$connectUtils.modified(req, res)) {
      $connectUtils.notModified(res);
      return;
    }

    // send otherwise!
    res.send(buffer, {
      "Content-Type": mimeType,
      "Content-Encoding": "gzip",
    });
  });
}

app.configure("production", function() {
  console.log("cur dir", process.cwd());
  var clientDir = process.cwd() + "/../../client";

  // Listen a port that should not (directly) have a hole in the firewall.  (We
  //  do expect port 80 to be redirected up to us, though.)
  LISTEN_PORT = 2080;
  gzippyFile("/",
             clientDir + "/index-optimized.html.gz",
             "text/html");
  gzippyFile("/arbpl-all.js",
             clientDir + "/built-arbclient.js.gz",
             "application/javascript");
});

app.get("/tree/:tree/push/:pushid/log/:buildid", function(req, res) {
  var tinderTree = $repodefs.safeGetTreeByName(req.params.tree);
  if (!tinderTree) {
    res.send(404);
    return;
  }
  var highPushId = req.param("highpushid");
  when(DB.getPushLogDetail(tinderTree.id,
                           req.params.pushid,
                           decodeURIComponent(req.params.buildid)),
    function(buildDetails) {
      res.send(buildDetails);
    },
    function(err) {
      res.send(500);
    });
});

console.log("LISTENING ON", LISTEN_PORT);
app.listen(LISTEN_PORT);

////////////////////////////////////////////////////////////////////////////////
// sideband notifications from the scraper, socket.io hookup

var sideServer = new $http.Server();
var scraperSink = new $databus.ScraperBridgeSink(sideServer);

var socky = $io.listen(app);
var dataServer = new $datastore.DataServer(socky, scraperSink);

console.log("SIDEBAND LISTENING ON", LISTEN_PORT + 1);
sideServer.listen(LISTEN_PORT + 1);

}); // end require.def
