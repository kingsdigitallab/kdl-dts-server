const xpath = require('xpath')
const dom = require('xmldom').DOMParser
const path = require("path");
const fs = require("fs");

// npx mocha -b -w ./tests/corpus.test.js

/**
 * Interface to a corpus of TEI files on disk or online.
 * Reads the files and build a flatten representation of the document tree.
 * Cache the tree on file system for subsequent use.
 */
class Corpus {
  constructor(source, reload=false) {
    this.cacheDir = '.corpus'
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir)
    }
    this.source = source
    this.buildAndSaveTree(reload)
  }

  buildAndSaveTree(reload=false) {
    if (reload || !this.readTree()) {
      this.buildTree()
      this.saveTree()
    }
  }

  readTree() {
    let ret = false
    let path = this.getTreePath()
    if (fs.existsSync(path)) {
      let content = fs.readFileSync(path)
      this.tree = JSON.parse(content)
      ret = true
    }
    return ret
  }

  saveTree() {
    fs.writeFileSync(
      this.getTreePath(), 
      JSON.stringify(this.tree, null, 2), 
      'utf8'
    )
  }

  getTreePath() {
    return `${this.cacheDir}/${this.getSourceSlug()}`
  }

  getSourceSlug() {
    return this.slugify(path.resolve(this.source))
  }

  slugify(str) {
    return str.replace(/\W+/g, "-").replace(/(^-|-$)/g, "")
  }

  getItemAndSubItems(id=null) {
    return {
      ...this.getItem(id),
      member: this.getSubItems(id)
    }
  }

  getItem(id=null) {
    let ret = null
    if (!id) {
      id = "ROOT"
    }
    ret = {...this.tree[id]}
    delete ret.tree
    return ret
  }

  getItemSource(id=null) {
    let ret = null
    if (!id) {
      id = "ROOT"
    }
    return this.tree[id].tree.source
  }

  getSubItems(id=null) {
    let ret = []
    if (!id) {
      id = "ROOT"
    }
    for (let item of Object.values(this.tree)) {
      if (item.tree.parent === id) {
        let copy = {...item}
        delete copy.tree
        ret.push(copy)
      }
    }
    return ret
  }

  buildTree(collectionPath) {
    // TODO: handle collections & sub-collections
    if (typeof collectionPath === "undefined") {
      collectionPath = this.source
      this.tree = {
        "ROOT": {
          "@id": "ROOT",
          "@type": "Collection",
          "title": "ROOT Collection",
          "tree": {
            "source": path.resolve(collectionPath),
            "parent": null,
            "updated": new Date()
          }
        }
      }
    }

    const directory = collectionPath;
  
    for (let filename of fs.readdirSync(directory).sort()) {
      let filePath = path.resolve(directory, filename);
      if (fs.lstatSync(filePath).isDirectory()) {
        this.buildTree(filePath);
      } else {
        if (filename.endsWith(".xml")) {
          let shortName = filename.replace(/\.[^.]*$/, "");
          // let documentId = `${idCollection}/${handle}`;
          let docId = `${shortName}`;
          // let teiMeta = await getMetadataFromTEIFile(filePath);
          this.tree[docId] = {
            "@id": docId,
            "@type": "Resource",
            "title": docId,
              // title: teiMeta.title,
            "tree": {
              "source": `${filePath}`,
              "parent": "ROOT",
            }
          };
        }
      }
    }
  }
  
  async getMetadataFromTEIFile(filePath) {
    let content = readFile(filePath);
    // optimisation: we extract the TEI header (so less xml to parse)
    let m = content.match(/^.*<\/teiHeader>/s);
    content = `${m[0]}</TEI>`;
    let doc = await SaxonJS.getResource({ text: content, type: "xml" });
  
    let ret = {
      title: "//teiHeader/fileDesc/titleStmt/title[1]/text()",
    };
  
    for (const [k, v] of Object.entries(ret)) {
      ret[k] = SaxonJS.XPath.evaluate(v, doc, {
        xpathDefaultNamespace: "http://www.tei-c.org/ns/1.0",
      }).data;
    }
  
    return ret;
  }
  
}

module.exports = Corpus
