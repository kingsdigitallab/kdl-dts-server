"use strict";
const path = require("path");
const fs = require("fs");
const dtsutils = require("kdl-dts-client")

class CorpusReader {

  constructor(source) {
    this.source = source
  }

  getAbsoluteSource() {
    throw Error("Method should be overridden.")
  }
  
  newTree() {
    let ret = {
      "ROOT": {
        "@id": "ROOT",
        "@type": "Collection",
        "title": "ROOT Collection",
        "tree": {
          "source": this.getAbsoluteSource(),
          "parent": null,
          "children": 0,
          "updated": new Date()
        }
      }
    }

    return ret
  }

  static new(source) {
    let ret = null
    if (source.startsWith("https://github.com/")) {
      ret = new CorpusReaderGitHub(source)
    }
    source = source.replace(/^file:\/\//, "")
    if (!source.match(/[a-z]+:\//)) {
      ret = new CorpusReaderFileSystem(source)
    }
    return ret
  }

  static getTreeItem(tree, id="ROOT") {
    if (id === "ROOT") {
      return Object.values(tree)[0]
    } else {
      return tree[id]
    }
  }
  
}

class CorpusReaderFileSystem extends CorpusReader {

  getAbsoluteSource() {
    return path.resolve(this.source)
  }

  async readItemContent(itemSource) {
    if (!itemSource) return null
    if (!fs.existsSync(itemSource)) return null

    // TODO: use readFile
    return fs.readFileSync(itemSource, {encoding:'utf8', flag:'r'})
  }

  async buildTree(collectionPath, ret, parent=null) {
    // TODO: handle collections & sub-collections
    if (typeof collectionPath === "undefined") {
      ret = this.newTree()
      collectionPath = this.source
      parent = CorpusReader.getTreeItem(ret)
    }

    const directory = collectionPath;
  
    for (let filename of fs.readdirSync(directory).sort()) {
      let filePath = path.join(directory, filename);
      if (fs.lstatSync(filePath).isDirectory()) {
        this.buildTree(filePath, ret, parent);
      } else {
        if (filename.endsWith(".xml")) {
          parent.tree.children += 1
          let shortName = filename.replace(/\.[^.]*$/, "");
          // let documentId = `${idCollection}/${handle}`;
          let docId = `${shortName}`;
          // let teiMeta = await getMetadataFromTEIFile(filePath);
          ret[docId] = {
            "@id": docId,
            "@type": "Resource",
            // "title": docId,
            // title: teiMeta.title,
            "tree": {
              "source": `${path.resolve(filePath)}`,
              "parent": parent['@id'],
            }
          };
        }
      }
    }

    return ret
  }

}

class CorpusReaderGitHub extends CorpusReader {
  getAbsoluteSource() {
    return this.source
  }

  async readItemContent(itemSource) {
    // console.log(`readItemContent "${itemSource}"`)
    if (!itemSource) return null
    // this.source: https://github.com/kingsdigitallab/kdl-dts-server/tree/main/tests/corpus
    // itemSource:  tests/corpus/02-doc2/doc2.xml
    // fetch: https://raw.githubusercontent.com/kingsdigitallab/kdl-dts-server/main/tests/corpus/02-doc2/doc2.xml
    // TODO
    let path = this.source.replace(
      /https:\/\/github\.com\/([^\/]+\/[^\/]+)\/tree\/([^\/]+).*$/, 
      `https://raw.githubusercontent.com/$1/$2/${itemSource}`
    )
    let ret = await dtsutils.fetchContent(path, 'xml')
    return ret
  }

  async buildTree(collectionPath) {
    // console.log(`Build DTS tree from github corpus (${this.source})`)

    let source = this.source
    source = source.replace(
      /^https:\/\/github.com\/(.*?)\/tree\/([^\/]+)\/?(.*)$/,
      "https://api.github.com/repos/$1/git/trees/$2?recursive=1"
    )
    let tree = null
    // TODO: temporary, remove this cdt
    if (1) {
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
    
    let ret = this.newTree()
    let parent = CorpusReader.getTreeItem(ret)

    for (let item of tree.tree) {
      if (!item.path.startsWith(pathPrefixFilter)) continue;
      if (!item.path.endsWith('.xml')) continue;
      let itemId = item.path.replace(/^.*\//, "")
      itemId = itemId.replace(/(.*?)\.\w+$/, "$1")
      parent.tree.children += 1
      ret[itemId] = {
        "@id": itemId,
        "@type": "Resource",
        // "title": itemId,
        tree: {
          source: item.path,
          parent: parent['@id']
        }
      }
    }

    return ret
  }

}

module.exports = CorpusReader
