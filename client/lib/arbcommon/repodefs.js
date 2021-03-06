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
 * Repo/tree/product schema definitions and current hard-coded sets.
 **/

define(
  [
    "exports"
  ],
  function(
    exports
  ) {


var CC_MAPPING = {
  // - Thunderbird Stuff
  "mail": {
    _: "Mail",
    branding: "Branding",
    components: {
      "about-support": "about:support",
      activity: "Activity Manager",
      addrbook: "Address Book",
      build: "Mail Build",
      compose: "Compose",
      migration: "Migration Wizard",
      phishing: "Phishing",
      preferences: "Prefs",
      search: "Search"
    },
    extensions: {
      smime: "SMIME"
    },
    installer: "Installer",
    jquery: "jQuery",
    locales: "l10n",
    steel: "STEEL",
    themes: {
      gnomestripe: "Linux Theme",
      pinstripe: "Mac Theme",
      qute: "Windows Theme",
    },
  },
  "mailnews": {
    _: "MailNews",
    addrbook: "Address Book",
    base: "MailNews Core",
    build: "MailNews Build",
    compose: "Compose",
    db: {
      gloda: "Gloda",
      msgdb: "Message DB",
    },
    extensions: {
      "bayesian-spam-filter": "Spam",
      fts3: "Gloda",
      mdn: "Message Receipts",
      newsblog: "Feeds",
      smime: "SMIME",
    },
    imap: "IMAP",
    "import": "Mail Import",
    local: "Local Folders",
    mapi: "Windows MAPI",
    mime: "libmime",
    news: "NNTP",
  },
  // - Other Product Top-levels
  suite: "SeaMonkey",
  calendar: "Calendar",
  // - Other stuff,
  ldap: "LDAP",
  editor: "CC Editor",
};


var MC_MAPPING = {
  accessible: "Accessibility",
  browser: "Firefox",
  content: "Content",
  config: "Build System",
  db: {
    mdb: "Mork",
    mork: "Mork",
    morkreader: "Mork",
    sqlite3: "SQLite",
  },
  docshell: "Layout",
  dom: {
    _: "Layout",
    indexedDB: "IndexedDB",
  },
  editor: "Editor",
  embedding: "Embedding",
  extensions: {
    _: "Extensions",
    inspector: "DOM Inspector",
    spellcheck: "Spelling",
  },
  gfx: "Graphics",
  intl: "l10n",
  ipc: "electrolysis",
  jpeg: "Graphics",
  js: {
    _: "Spidermonkey",
    ipc: "electrolysis",
    jetpack: "Jetpack",
    jsd: "JS Debugging",
    src: {
      ctypes: "JS CTypes",
      methodjit: "Spidermonkey Method JIT",
      nanjoit: "Spidermonkey NanoJIT",
      xpconnect: "XPConnect"
    }
  },
  layout: {
    _: "Layout",
    xul: "XUL",
  },
  media: "Video",
  memory: {
    jemalloc: "jemalloc",
    mozalloc: "mozalloc",
  },
  modules: {
    _: "Generic Modules",
    freetype2: "FreeType",
    lib7z: "Compression Libs",
    libbz2: "Compression Libs",
    libimg: "Graphics",
    libjar: "Compression Libs",
    libmar: "Compression Libs",
    libpr0n: "Graphics",
    libpref: "Preferences",
    // libreg ??
    plugin: "Plugins",
    zlib: "Compression Libs",
  },
  netwerk: {
    _: "Necko",
    mime: "libmime outpost",
  },
  nsprpub: "NSPR",
  "other-licenses": {
    _: "Generic Modules",
    "7zstub": "Installer",
    android: "Mobile",
    "atk-1.0": "Accessibility",
    branding: "Branding",
    bsdiff: "Installer",
    nsis: "Installer",
  },
  parser: {
    expat: "XML",
    html: "HTML Parser",
    htmlparser: "HTML Parser",
    xml: "XML",
  },
  probes: "DTrace",
  profile: "Profile",
  rdf: "RDF",
  security: {
    _: "Security",
    nss: "NSS",
  },
  services: {
    crypto: "Security",
    sync: "Weave",
  },
  startupcache: "Startup Cache",
  storage: "mozStorage",
  testing: "Test Infrastructure",
  toolkit: {
    _: "Toolkit",
    components: {
      places: "Places",
      printing: "Printing",
      satchel: "Form History",
    },
    crashreporter: "Crash Reporter",
    mozapps: {
      downloads: "Downloads",
    },
    system: {
      dbus: "DBUS",
    },
    themes: {
      _: "Other Theme",
      gnomestripe: "Linux Theme",
      pinstripe: "Mac Theme",
      winstripe: "Windows Theme",
    },
  },
  tools: "Generic Tools",
  widget: "Widget",
  xpcom: "XPCOM",
  xpfe: "XPFE",
  xpisntall: "xpinstall",
  xulrunner: "XULRunner",
};


/**
 * @typedef[CodeRepoKind @oneof[
 *   @case["trunk"]{
 *     Active development branch; may be fed into by feature or team branches
 *     depending on usage.
 *   }
 *   @case["team"]{
 *     A branch which serves as a working area for a development team and is
 *     periodically merged into a trunk/release branch.  For example, the
 *     places or tracemonkey branches.
 *   }
 *   @case["feature"]{
 *     Development branch for a targeted feature (as opposed to a team) and
 *     tracks a trunk/release branch.
 *   }
 *   @case["try"]{
 *     A try-server branch with no meaningful chronology that generally
 *     tracks/forks off of a specific underlying branch, but could also
 *     periodically receive pushes relating to other branches that forked
 *     off of the nominal underlying branch at some point.
 *   }
 *   @case["release"]{
 *     A stabilized product release branch.
 *   }
 * ]]
 **/

/**
 * Specific mercurial code repository information.
 */
function CodeRepoDef(def) {
  this.name = def.name;
  this.url = def.url;
  this.kind = def.kind;
  this.relto = ("relto" in def) ? def.relto : null;
  this.path_mapping = def.path_mapping;
  this.family = def.family;
}
CodeRepoDef.prototype = {
  toString: function() {
    return ["repo: " + this.name];
  },
};

var REPOS = exports.REPOS = {
  "comm-central": new CodeRepoDef({
    name: "comm-central",
    url: "http://hg.mozilla.org/comm-central/",
    kind: "trunk",
    path_mapping: CC_MAPPING,
    family: "comm",
  }),
  "try-comm-central": new CodeRepoDef({
    name: "try-comm-central",
    url: "http://hg.mozilla.org/try-comm-central/",
    kind: "try",
    relto: "comm-central",
    path_mapping: CC_MAPPING,
    family: "comm",
  }),

  "mozilla-central": new CodeRepoDef({
    name: "mozilla-central",
    url: "http://hg.mozilla.org/mozilla-central/",
    kind: "trunk",
    path_mapping: MC_MAPPING,
    family: "mozilla",
  }),
  "try": new CodeRepoDef({
    name: "try",
    url: "http://hg.mozilla.org/try/",
    kind: "try",
    relto: "mozilla-central",
    path_mapping: MC_MAPPING,
    family: "mozilla",
  }),
  "tracemonkey": new CodeRepoDef({
    name: "tracemonkey",
    url: "http://hg.mozilla.org/tracemonkey/",
    kind: "team",
    relto: "mozilla-central",
    path_mapping: MC_MAPPING,
    family: "mozilla",
  }),

  "comm-1.9.2": new CodeRepoDef({
    name: "comm-1.9.2",
    url: "http://hg.mozilla.org/releases/comm-1.9.2/",
    kind: "release",
    path_mapping: CC_MAPPING,
    family: "comm",
  }),
  "comm-1.9.1": new CodeRepoDef({
    name: "comm-1.9.1",
    url: "http://hg.mozilla.org/releases/comm-1.9.1/",
    kind: "release",
    path_mapping: CC_MAPPING,
    family: "comm",
  }),
  "mozilla-2.1": new CodeRepoDef({
    name: "mozilla-2.1",
    url: "http://hg.mozilla.org/releases/mozilla-2.1/",
    kind: "release",
    path_mapping: MC_MAPPING,
    family: "mozilla",
  }),
  "mozilla-2.0": new CodeRepoDef({
    name: "mozilla-2.0",
    url: "http://hg.mozilla.org/releases/mozilla-2.0/",
    kind: "release",
    path_mapping: MC_MAPPING,
    family: "mozilla",
  }),
  "mozilla-1.9.2": new CodeRepoDef({
    name: "mozilla-1.9.2",
    url: "http://hg.mozilla.org/releases/mozilla-1.9.2/",
    kind: "release",
    path_mapping: MC_MAPPING,
    family: "mozilla",
  }),
  "mozilla-1.9.1": new CodeRepoDef({
    name: "mozilla-1.9.1",
    url: "http://hg.mozilla.org/releases/mozilla-1.9.1/",
    kind: "release",
    path_mapping: MC_MAPPING,
    family: "mozilla",
  }),
};

/**
 * Tinderbox tree definition; consists of one or more code repositories
 *  associated with a specific product.
 */
function TinderTreeDef(def) {
  this.id = def.id;
  this.name = def.name;
  this.desc = def.desc;
  this.product = def.product;
  this.repos = def.repos;
  this.mount = def.mount;
  if (def.hasOwnProperty("typeGroups")) {
    this.typeGroupBundles = [
      {
        name: "all",
        platforms: {_: true},
        typeGroups: def.typeGroups
      }
    ];
  }
  else if (def.hasOwnProperty("typeGroupBundles")) {
    this.typeGroupBundles = def.typeGroupBundles;
  }
  else
    throw new Error("tinder tree def needs typeGroups or typeGroupBundles");
}
TinderTreeDef.prototype = {
  toString: function() {
    return "[tinderbox: " + this.id + "]";
  },
};

var TB_TYPE_GROUPS = [
  "build",
  "xpcshell",
  "mozmill",
  "nightly",
];

var FF_TYPE_GROUPS = [
  "build",
  "xpcshell",
  {
    name: "mochitest",
    subgroups: [
      {name: "1", subtype: "mochitest", capture: "1"},
      {name: "2", subtype: "mochitest", capture: "2"},
      {name: "3", subtype: "mochitest", capture: "3"},
      {name: "4", subtype: "mochitest", capture: "4"},
      {name: "5", subtype: "mochitest", capture: "5"},
      {name: "oth", subtype: "mochitest", capture: "other"},
    ]
  },
  {
    name: "reftest",
    subgroups: [
      {name: "crash", subtype: "reftest", capture: "crashtest"},
      {name: "crash-ipc", subtype: "reftest", capture: "crashtest-ipc"},
      {name: "js", subtype: "reftest", capture: "jsreftest"},
      {name: "reftest", subtype: "reftest", capture: "reftest"},
      {name: "reftest-ipc", subtype: "reftest", capture: "reftest-ipc"},
    ]
  },
  {
    name: "talos", subgroups: [
      {name: "a11y", subtype: "talos", capture: "a11y"},
      {name: "chrome", subtype: "talos", capture: "chrome"},
      {name: "dirty", subtype: "talos", capture: "dirty"},
      {name: "dromaeo", subtype: "talos", capture: "dromaeo"},
      {name: "nochrome", subtype: "talos", capture: "nochrome"},
      {name: "scroll", subtype: "talos", capture: "scroll"},
      {name: "svg", subtype: "talos", capture: "svg"},
      {name: "tp4", subtype: "talos", capture: "tp4"},
    ]
  },
];

var TINDER_TREES = exports.TINDER_TREES = {
  ThunderbirdTrunk: new TinderTreeDef({
    id: "cc",
    name: "ThunderbirdTrunk",
    desc: "comm-central built using mozilla-central; eventually TB 3.4",
    product: "Thunderbird",
    repos: [REPOS["comm-central"], REPOS["mozilla-central"]],
    mount: {
      mozilla: REPOS["mozilla-central"],
    },
    typeGroups: TB_TYPE_GROUPS,
  }),
  Miramar: new TinderTreeDef({
    id: "c20",
    name: "Miramar",
    desc: "comm-central built using mozilla-2.0; next TB release, TB 3.3",
    product: "Thunderbird",
    repos: [REPOS["comm-central"], REPOS["mozilla-2.0"]],
    mount: {
      mozilla: REPOS["mozilla-central"],
    },
    typeGroups: TB_TYPE_GROUPS,
  }),
  ThunderbirdTry: new TinderTreeDef({
    id: "ctry",
    name: "ThunderbirdTry",
    desc: "comm-central try server",
    product: "Thunderbird",
    repos: [REPOS["try-comm-central"], REPOS["mozilla-central"]],
    mount: {
      mozilla: REPOS["mozilla-central"],
    },
    typeGroups: TB_TYPE_GROUPS,
  }),

  // releases/comm-1.9.2 => c192
  // releases/comm-1.9.1 => c191

  // mozilla-central => mc
  Firefox: new TinderTreeDef({
    id: "mc",
    name: "Firefox",
    desc: "Firefox trunk",
    product: "Firefox",
    repos: [REPOS["mozilla-central"]],
    mount: {
    },
    typeGroups: FF_TYPE_GROUPS,
  }),
  // try => mtry
  MozillaTry: new TinderTreeDef({
    id: "mtry",
    name: "MozillaTry",
    desc: "Firefox / mozilla-central try server",
    product: "Firefox",
    repos: [REPOS["try"]],
    mount: {
    },
    typeGroups: FF_TYPE_GROUPS,
  }),

  // tracemonkey => tm
  TraceMonkey: new TinderTreeDef({
    id: "tm",
    name: "TraceMonkey",
    desc: "JavaScript team's mozilla-central branch",
    product: "Firefox",
    repos: [REPOS["tracemonkey"]],
    mount: {
    },
    typeGroupBundles: [
      {
        name: "desktop",
        platforms: {
          linux: true,
          mac: true,
          win: true,
        },
        typeGroups: [
          {
            name: "build",
            subgroups: [
              {name: "build", subtype: "build"},
              {name: "QT", subtype: "qt"},
              {name: "mobile", subtype: "mobile"},
              {name: "no mjit", subtype: "nomethodjit"},
              {name: "no trace", subtype: "notracejit"},
              {name: "dtrace", subtype: "dtrace"},
              {name: "shark", subtype: "shark"},
              {name: "nightly", subtype: "nightly"},
            ],
          },
          "xpcshell",
          {
            name: "mochitest",
            subgroups: [
              {name: "1", subtype: "mochitest", capture: "1"},
              {name: "2", subtype: "mochitest", capture: "2"},
              {name: "3", subtype: "mochitest", capture: "3"},
              {name: "4", subtype: "mochitest", capture: "4"},
              {name: "5", subtype: "mochitest", capture: "5"},
              {name: "oth", subtype: "mochitest", capture: "other"},
            ]
          },
          {
            name: "reftest",
            subgroups: [
              {name: "crash", subtype: "reftest", capture: "crashtest"},
              {name: "crash-ipc", subtype: "reftest", capture: "crashtest-ipc"},
              {name: "js", subtype: "reftest", capture: "jsreftest"},
              {name: "reftest", subtype: "reftest", capture: "reftest"},
              {name: "reftest-ipc", subtype: "reftest", capture: "reftest-ipc"},
            ]
          },
          {
            name: "talos", subgroups: [
              {name: "a11y", subtype: "talos", capture: "a11y"},
              {name: "chrome", subtype: "talos", capture: "chrome"},
              {name: "dirty", subtype: "talos", capture: "dirty"},
              {name: "dromaeo", subtype: "talos", capture: "dromaeo"},
              {name: "nochrome", subtype: "talos", capture: "nochrome"},
              {name: "scroll", subtype: "talos", capture: "scroll"},
              {name: "svg", subtype: "talos", capture: "svg"},
              {name: "tp4", subtype: "talos", capture: "tp4"},
              {name: "v8", subtype: "talos", capture: "v8"},
            ]
          },
        ],
      },
      {
        name: "mobile",
        platforms: {
          android: true,
          maemo: true,
        },
        typeGroups: [
          {
            name: "build",
            subgroups: [
              {name: "build", subtype: "build"},
              {name: "nightly", subtype: "nightly"},
            ],
          },
          {
            name: "mochitest",
            subgroups: [
              {name: "1", subtype: "mochitest", capture: "1"},
              {name: "2", subtype: "mochitest", capture: "2"},
              {name: "3", subtype: "mochitest", capture: "3"},
              {name: "4", subtype: "mochitest", capture: "4"},
            ]
          },
          { name: "crash", subtype: "reftest", capture: "crashtest"},
          {
            name: "talos", subgroups: [
              {name: "tdhtml", subtype: "talos", capture: "tdhtml"},
              {name: "twinopen", subtype: "talos", capture: "twinopen"},
              {name: "tp4", subtype: "talos", capture: "tp4"},
              {name: "ts", subtype: "talos", capture: "ts"},
              {name: "tsspider", subtype: "talos", capture: "tsspider"},
              {name: "tp4_nochrome", subtype: "talos", capture: "tp4_nochrome"},
              {name: "tsvg", subtype: "talos", capture: "tsvg"},
              {name: "tpan", subtype: "talos", capture: "tpan"},
            ]
          },
        ],
      },
    ],
  }),

  // projects/places => places

  // releases/mozilla-2.0 => m20
  // releases/mozilla-1.9.2 => m192
  // releases/mozilla-1.9.1 => m191

  SeaMonkey: new TinderTreeDef({
    id: "st",
    name: "SeaMonkey",
    desc: "SeaMonkey suite (browser/mailnews client/composer/more)",
    product: "SeaMonkey",
    repos: [REPOS["comm-central"], REPOS["mozilla-central"]],
    mount: {
      mozilla: REPOS["mozilla-central"],
    },
    typeGroups: [
      "build",
      "xpcshell",
      {
        name: "mochitest",
        subgroups: [
          {name: "1", subtype: "mochitest", capture: "1"},
          {name: "2", subtype: "mochitest", capture: "2"},
          {name: "3", subtype: "mochitest", capture: "3"},
          {name: "4", subtype: "mochitest", capture: "4"},
          {name: "5", subtype: "mochitest", capture: "5"},
          {name: "oth", subtype: "mochitest", capture: "other"},
        ]
      },
      {
        name: "reftest",
        subgroups: [
          {name: "crash", subtype: "reftest", capture: "crash"},
          {name: "reftest", subtype: "reftest", capture: "reftest"},
        ]
      },
    ],
  }),

};

/**
 * A special magic dummy tree for "localchew" inserted logs.
 */
var DUMMY_LOCAL_TREE = new TinderTreeDef({
  id: "local",
  name: "Local",
  desc: "Local logs you imported...",
  product: "Local",
  repos: [REPOS["comm-central"]],
  mount: {},
  typeGroups: [
    "mozmill",
  ],
});

exports.safeGetTreeByName = function safeGetTreeByName(treeName) {
  for (var key in TINDER_TREES) {
    var tree = TINDER_TREES[key];
    if (tree.name == treeName)
      return tree;
  }
  if (treeName == "Local")
    return DUMMY_LOCAL_TREE;
  return null;
};

}); // end define
