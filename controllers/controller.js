"use strict";

// TODO: add text metadata from TEI
// TODO: use SaxonJS instead of DOMParser & XPath
const SaxonJS = require("saxon-js");
const fs = require("fs");
const DOMParser = require("@xmldom/xmldom").DOMParser;
const settings = require("../settings.js");
const XPath = require("xpath");
const collectionRoot = settings.source;
const Corpus = require("./corpus")
const corpus = new Corpus(settings.source)
corpus.buildAndSaveTree()
// tei namespace
const TEINS = "http://www.tei-c.org/ns/1.0";

let idPrefix = settings.baseUri;
// only one collection in our project at the moment,
// it contains the four books/editions
let idCollection = `${idPrefix}${settings.rootCollection.slug}/`;

let cache = {
  lastRead: {},
};

// TODO: server starts by creating a corpus index
// Use that for retrieval based on doc ID
// TODO: support for dts:passage & passage (also in client)

// FOR DYNAMIC:
//  prefix/DOC (don't use collection)
//  DOC = slug(filename)
//  Warning on duplicates
// FOR STATIC:
//  ID = url of the doc (or the doc as a collection?)
//  https://github.com/kingsdigitallab/alice-thornton/tree/main/dts/documents/book-one

var controllers = {
  root: (req, res) => {
    let ret = {
      "@context": "/contexts/EntryPoint.jsonld",
      "@id": `${settings.services.root}`,
      "@type": "EntryPoint",
    };
    // add abs path of each DTS service (e.g. collections: '/collections/')
    for (let key of Object.keys(settings.services)) {
      if (key != "root") {
        ret[key] = settings.services[key];
      }
    }
    res.json(ret);
  },
  collections: async (req, res) => {
    let ret = await corpus.getItemAndSubItems()
    /*
    TODO:
      "@context": {
        "@vocab": "https://www.w3.org/ns/hydra/core#",
        dc: "http://purl.org/dc/terms/",
        dts: "https://w3id.org/dts/api#",
      },
    */
    // enrich members
    for (let member of ret.member) {
      let mid = member["@id"];
      Object.assign(member, {
        "dts:references": `${settings.services.navigation}?id=${mid}`,
        "dts:passage": `${settings.services.documents}?id=${mid}`,
        "dts:maxCiteDepth": 1,
        "dts:citeStructure": [
          // TODO: chapters
          {
            "dts:citeType": "page",
          },
        ],
      });
    }
    return res.json(ret)
  },
  collections2: async (req, res) => {
    // id, page, nav
    // let q = req.query
    let members = [
      {
        "@id": `${idCollection}book_one/`,
        title: "First Book of My Life",
        // "description": "Test",
        // "dts:dublincore": {
        //     "dc:title": [{"@language": "la", "@value": "Test"}],
        //     "dc:description": [{
        //        "@language": "en",
        //        "@value": "Anonymous Poems "
        //     }],
        //     "dc:type": [
        //         "http://chs.harvard.edu/xmlns/cts#edition",
        //         "dc:Text"
        //     ],
        //     "dc:source": ["https://archive.org/details/poetaelatinimino12baeh2"],
        //     "dc:dateCopyrighted": 1879,
        //     "dc:creator": [
        //         {"@language": "en", "@value": "Anonymous"}
        //     ],
        //     "dc:contributor": ["Aemilius Baehrens"],
        //     "dc:language": ["la", "en"]
        // },
        //"dts:download": "https://raw.githubusercontent.com/lascivaroma/priapeia/master/data/phi1103/phi001/phi1103.phi001.lascivaroma-lat1.xml",
      },
    ];

    members = await findTEIFiles(collectionRoot);

    let ret = {
      "@context": {
        "@vocab": "https://www.w3.org/ns/hydra/core#",
        dc: "http://purl.org/dc/terms/",
        dts: "https://w3id.org/dts/api#",
      },
      "@id": `${idCollection}`,
      "@type": "Collection",
      title: settings.rootCollection.title,
      "dts:dublincore": {
        "dc:publisher": ["King's Digital Lab, King's College London"],
        // "dc:type": ["http://chs.harvard.edu/xmlns/cts#work"],
        // "dc:creator": [
        //     {"@language": "en", "@value": "Anonymous"}
        // ],
        // "dc:language": ["la", "en"],
        // "dc:title": [{"@language": "la", "@value": "Test"}],
        // "dc:description": [{
        //    "@language": "en",
        //     "@value": "Anonymous Poems "
        // }]
      },
      totalItems: members.length,
      "dts:totalParents": 0,
      "dts:totalChildren": members.length,
      member: members,
    };
    for (let member of ret.member) {
      let mid = member["@id"];
      Object.assign(member, {
        totalItems: 0,
        "@type": "Resource",
        "dts:totalParents": 1,
        "dts:totalChildren": 0,
        "dts:references": `${settings.services.navigation}?id=${mid}`,
        "dts:passage": `${settings.services.documents}?id=${mid}`,
        "dts:maxCiteDepth": 1,
        "dts:citeStructure": [
          // TODO: chapters
          {
            "dts:citeType": "page",
          },
        ],
      });
    }
    res.json(ret);
    // res.header("Access-Control-Allow-Origin", "*");
    // res.header("Access-Control-Allow-Headers", "X-Requested-With");
  },
  navigation: async (req, res) => {
    // eg. https://betamasaheft.eu/api/dts/navigation?id=/api/dts/navigation?id=https://betamasaheft.eu/LIT6726AnastasiusPsalm
    // id, ref, start, end, down, groupBy, max, exclude
    // TODO: pagination ()
    let q = req.query;
    let pages = await getPagesFromDocument(q.id);
    var ret = {
      "@context": {
        "@vocab": "https://www.w3.org/ns/hydra/core#",
        dc: "http://purl.org/dc/terms/",
        dts: "https://w3id.org/dts/api#",
      },
      "@id": req.originalUrl,
      "dts:maxCiteDepth": 1,
      "dts:level": 0,
      "dts:citeType": "page",
      member: pages.map((p) => {
        return { "dts:ref": `p.${p}`, "dts:level": 1 };
      }),
      "dts:passage": `${settings.services.documents}?id=${q.id}`,
    };
    res.json(ret);
  },
  documents: async (req, res) => {
    // id, ref, start, end, after, before, token, format
    let q = req.query;
    let rid = q.id;

    let chunk = await getXMLFromPageNumber(rid, q.ref);
    // console.log(chunk)
    if (!chunk) {
      // TODO: remove hard-coded xml:id
      chunk = `<?xml version="1.0" encoding="UTF-8"?>
      <TEI xmlns="http://www.tei-c.org/ns/1.0" xml:id="atb-book-of-remembrances"></TEI>`;
    }
    // TODO: or XML? HTML? TEI?
    // res.set("Content-Type", "text/plain");
    let contentType = "application/tei+xml"
    // res.type('html')

    if (q.format == "html") {
      chunk = getHTMLfromTEI(chunk);
      contentType = "text/html; charset=utf-8"
    }

    res.set("Content-Type", contentType);
    res.send(chunk);
  },
};

// TODO: convert those functions into a class

// async function getMetadataFromTEIFile(filePath) {
//   let content = readFile(filePath);
//   // optimisation: we extract the TEI header (so less xml to parse)
//   let m = content.match(/^.*<\/teiHeader>/s);
//   content = `${m[0]}</TEI>`;
//   let doc = await SaxonJS.getResource({ text: content, type: "xml" });

//   let ret = {
//     title: "//teiHeader/fileDesc/titleStmt/title[1]/text()",
//   };

//   for (const [k, v] of Object.entries(ret)) {
//     ret[k] = SaxonJS.XPath.evaluate(v, doc, {
//       xpathDefaultNamespace: "http://www.tei-c.org/ns/1.0",
//     }).data;
//   }

//   return ret;
// }

function getHTMLfromTEI(tei) {
  let ret = "";

  // todo: regenerate sef.json file if older than xslt
  // npx xslt3 -xsl:tei-to-html.xsl -export:tei-to-html.sef.json -t -ns:##html5 -nogo
  let output = SaxonJS.transform(
    {
      stylesheetFileName: "responses/tei-to-html.sef.json",
      sourceText: tei,
      destination: "serialized",
    },
    "sync"
  );

  ret = output.principalResult;

  // remove all namespaces
  ret = ret.replace(/\s*xmlns(:\w+)?="[^"]*"\s*/gs, " ");
  // remove xml declaration
  ret = ret.replace(/<\?xml\\s+version="1.0"\\s+encoding="UTF-8"\?>/, "");

  return ret;
}

async function getPagesFromDocument(documentId) {
  let ret = [];
  let content = await getContentFromDocumentId(documentId);
  let regex = RegExp('<pb [^>]*n="(\\d+)"\\s*/>', "sg");
  let matches = content.matchAll(regex);
  for (let match of matches) {
    ret.push(match[1]);
  }
  return ret;
}

async function getContentFromDocumentId(documentId) {
  let ret = cache.lastRead.content;
  if (!ret || cache.lastRead.documentId != documentId) {
    ret = await corpus.readItemContent(documentId)
    cache.lastRead = {
      documentId: documentId,
      content: ret,
      // TODO: on demand only, not always needed?
      dom: new DOMParser().parseFromString(ret),
      pbs: {},
    }

    let select = XPath.useNamespaces({ tei: TEINS });
    for (let pb of select("//tei:pb", cache.lastRead.dom)) {
      cache.lastRead.pbs[pb.getAttribute("n")] = pb;
    }
  }

  return ret
}

async function getXMLFromPageNumber(documentId, ref) {
  // let ret = `Ref '${ref}' not found in doc '${documentId}'`;
  let ret = null;
  // TODO: extract page using xpath & dom
  // method: take all add all the elements
  // situated between the pbs and their nearest common ancestor
  // TODO: parametrise the element separating units of texts (not just pb)

  let pageNumber = ref.match(/^p\.(\d+)$/);
  if (pageNumber) {
    let pn = pageNumber[1]; //.padStart(3, '0')
    let content = await getContentFromDocumentId(documentId);
    let pnNext = "" + (parseInt(pn, 10) + 1);
    // console.log(pnNext)

    let pb = cache.lastRead.pbs[pn];
    // TODO: find next pb, don't assume it's n+1
    // TODO: corner case: pb is the last in the doc
    let pbNext = cache.lastRead.pbs[pnNext];

    // PART 1: get non-common ancestors of each edge
    let edgesAncestors = [];
    let edgesAncestorsStr = ["", ""];

    if (pb && pbNext) {
      for (let parent of [pb, pbNext]) {
        let ancestors = [];
        // console.log(`PB = ${parent.getAttribute("n")}`)
        while (parent.parentNode) {
          parent = parent.parentNode;
          // console.log(`  ${parent.nodeName}`)
          ancestors.push(parent);
        }
        edgesAncestors.push(ancestors);
      }

      // serialise the non-common ancestors of each edge.
      // we only serialise the ancestors tags, not their children.
      // edgesAncestors => edgesAncestorsStr.
      let i = 0;
      let closing = "";
      for (let apb of [pb, pbNext]) {
        // console.log(`PB = ${apb.getAttribute("n")}`)
        let ancestorsStr = "";
        if (!i) edgesAncestors[i].reverse();
        for (let parent of edgesAncestors[i]) {
          if (parent == apb) continue;
          // ignore common ancestors
          if (edgesAncestors[1 - i].indexOf(parent) > -1) continue;
          let parentStr = `<${closing}${parent.nodeName}>`;
          ancestorsStr += parentStr;
        }
        // console.log(`  ${ancestorsStr}`)
        edgesAncestorsStr[i] = ancestorsStr;
        closing = "/";
        i += 1;
      }
    } else {
      console.log(
        `WARNING: page not found ${pn} or ${pnNext} in ${documentId}`
      );
    }

    // PART 2: crop the XML with a regexp betwen the two edges
    let regex = RegExp(
      `<pb [^>]*n="${pn}"\\s*/>(.*)<pb [^>]*n="${pnNext}"`,
      "s"
    );
    let m = content.match(regex);
    // console.log(m)

    let headerMatch = content.match(/^.*<\/teiHeader>/s);

    if (m) {
      // surround the crop by the non-common ancestors so the XML is well-formed
      ret = `${headerMatch[0]}
        <dts:fragment xmlns:dts="https://w3id.org/dts/api#">
          ${edgesAncestorsStr[0]}
          ${m[1]}
          ${edgesAncestorsStr[1]}
        </dts:fragment>
      </TEI>`;
      // dirty fix of not well-formed XML/HTML
      let doc = new DOMParser().parseFromString(ret);
      ret = doc.toString();
      // console.log('h2')
    }
  }
  return ret;
}

module.exports = controllers;
