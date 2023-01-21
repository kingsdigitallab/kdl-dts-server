const xpath = require('xpath')
const dom = require('xmldom').DOMParser
const path = require("path");
const fs = require("fs");
const CorpusReader = require("./corpusReader")

// npx mocha -b -w ./tests/corpus.test.js


/*
TODO:
M move file caching from controller to here
M add missing DTS fields in the getItem responses
M improve the IDs (in controller?)
M move file reading from controller to Corpus class
M create extension that can read corpus from Github folders
S optimise for large collections on github (with caching, lazy loading & pagination)
S document limitations (e.g. unique file name or @xml:id)
C support for sub-collections (using a .collection.json file under each collection folder) 
*/

/**
 * Interface to a corpus of TEI files on disk or online.
 * Reads the files and build a flatten representation of the document tree.
 * Cache the tree on file system for subsequent use.
 */
class Corpus {
  constructor(source) {
    this.setSource(source)
    this.setCacheDir()
  }

  setCacheDir() {
    this.cacheDir = '.corpus'
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir)
    }
  }

  setSource(source) {
    this.source = source
    this.setReader()
  }

  setReader() {
    this.reader = CorpusReader.new(this.source)
    if (!this.reader) {
      throw Error(`Could not create a CorpusReader for the given source (${this.source})`)
    }
  }

  async buildAndSaveTree(reload=false) {
    if (reload || !this.readTree()) {
      this.tree = await this.reader.buildTree()
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
    console.log(`Save tree ${this.getTreePath()}`)
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
    return this.slugify(this.reader.getAbsoluteSource())
  }

  slugify(str) {
    return str.replace(/\W+/g, "-").replace(/(^-|-$)/g, "")
  }

  getItemAndSubItems(id="ROOT") {
    return {
      "@context": "https://distributed-text-services.github.io/specifications/context/1.0.0draft-2.json",
      ...this.getItem(id),
      member: this.getSubItems(id)
    }
  }

  getItem(id="ROOT") {
    return this._cleanItem(this._getItem(id))
  }

  _getItem(id="ROOT") {
    return CorpusReader.getTreeItem(this.tree, id)
  }

  _cleanItem(item) {
    if (!item) return null
    let ret = {...item}
    ret.totalParents = item.tree.parent ? 1 : 0;
    ret.totalItems = item.tree.children || 0
    ret.totalChildren = item.tree.children || 0
    delete ret.tree
    return ret
  }

  getItemSource(id="ROOT") {
    return this._getItem(id).tree.source
  }

  getSubItems(id="ROOT") {
    let ret = []
    for (let item of Object.values(this.tree)) {
      if (item.tree.parent === id) {
        ret.push(this._cleanItem(item))
      }
    }
    return ret
  }

  async readItemContent(id="ROOT") {
    // console.log(this.tree[id])
    return await this.reader.readItemContent(this._getItem(id)?.tree?.source)
  }

  // resetTree() {
  //   this.tree = {
  //     "ROOT": {
  //       "@id": "ROOT",
  //       "@type": "Collection",
  //       "title": "ROOT Collection",
  //       "tree": {
  //         "source": this.getAbsoluteSource(),
  //         "parent": null,
  //         "updated": new Date()
  //       }
  //     }
  //   }

  //   return this.tree
  // }

  // async buildTree(collectionPath) {
  //   // TODO: handle collections & sub-collections
  //   if (typeof collectionPath === "undefined") {
  //     collectionPath = this.source
  //     this.resetTree()
  //   }

  //   const directory = collectionPath;
  
  //   for (let filename of fs.readdirSync(directory).sort()) {
  //     let filePath = this.getAbsoluteSource();
  //     if (fs.lstatSync(filePath).isDirectory()) {
  //       this.buildTree(filePath);
  //     } else {
  //       if (filename.endsWith(".xml")) {
  //         let shortName = filename.replace(/\.[^.]*$/, "");
  //         // let documentId = `${idCollection}/${handle}`;
  //         let docId = `${shortName}`;
  //         // let teiMeta = await getMetadataFromTEIFile(filePath);
  //         this.tree[docId] = {
  //           "@id": docId,
  //           "@type": "Resource",
  //           "title": docId,
  //             // title: teiMeta.title,
  //           "tree": {
  //             "source": `${filePath}`,
  //             "parent": "ROOT",
  //           }
  //         };
  //       }
  //     }
  //   }
  // }
  
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
