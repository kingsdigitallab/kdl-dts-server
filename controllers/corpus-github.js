const xpath = require('xpath')
const dom = require('xmldom').DOMParser
const path = require("path");
const fs = require("fs");
const Corpus = require("./corpus")
const dtsutils = require("kdl-dts-client")

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
class CorpusGitHub extends Corpus {

  // const source = "https://github.com/kingsdigitallab/alice-thornton/tree/edition/texts"
  // https://api.github.com/repos/kingsdigitallab/alice-thornton/git/trees/edition?recursive=1

  getAbsoluteSource() {
    return this.source
  }

  async buildTree(collectionPath) {

    let source = this.source
    source = source.replace(
      /^https:\/\/github.com\/(.*?)\/tree\/([^\/]+)\/?(.*)$/,
      "https://api.github.com/repos/$1/git/trees/$2?recursive=1"
    )
    let tree = null
    // TODO: temporary, remove this cdt
    if (0) {
      tree = await dtsutils.fetchContent(source)
    } else {
      let path = './tests/gh-trees.json'
      let content = fs.readFileSync(path)
      tree = JSON.parse(content)
    }

    let pathPrefixFilter = this.source.replace(
      /^https:\/\/github.com\/.*?\/tree\/([^\/]+)\/?(.*)$/,
      "$2"
    )
    if (pathPrefixFilter) pathPrefixFilter += "/"
    
    this.resetTree()

    for (let item of tree.tree) {
      if (!item.path.startsWith(pathPrefixFilter)) continue;
      if (!item.path.endsWith('.xml')) continue;
      let itemId = item.path.replace(/^.*\//, "")
      itemId = itemId.replace(/(.*?)\.\w+$/, "$1")
      this.tree[itemId] = {
        "@id": itemId,
        "@type": "Resource",
        "title": itemId,
        tree: {
          path: item.path,
          parent: "ROOT"
        }
      }
    }
  }

}

module.exports = CorpusGitHub
