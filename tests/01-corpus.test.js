const assert = require('assert');
const expect = require('chai').expect
const Corpus = require('../controllers/corpus')

/*
npx mocha -b -w ./tests/01-corpus.test.js
TODO:
  improve describe/it structure
*/

const sources = [
  "tests/corpus",
  "https://github.com/kingsdigitallab/kdl-dts-server/tree/main/tests/corpus"
  // "https://github.com/kingsdigitallab/alice-thornton/tree/edition/texts"
]

for (let source of sources) {
  describe(`Unit testing Corpus class, source = ${source}`, function() {

    let corpus = null
    let root = null

    it('should instantiate from an address', function() {
      corpus = new Corpus(source)
      assert.ok(corpus)
    });

    it('return a root collection', async function() {
      await corpus.buildAndSaveTree(!source.startsWith('http'))
      root = await corpus.getItem()
      assert.ok(root)
      assert.equal(root.totalParents, 0)
    });

    it('return two documents under the root collection', async function() {
      let items = await corpus.getSubItems()
      assert.equal(items.length, 2)
    });

    it('return two documents under the root collection', async function() {
      let item = await corpus.getItemAndSubItems()
      // console.log(item)
      assert.equal(item.member.length, 2)
    });

    it('return the content of the first member under root collection', async function() {
      let item = await corpus.getItemAndSubItems()
      let content = await corpus.readItemContent(item.member[0]["@id"])
      assert.ok(content)
      assert.ok(content.length > 10)
      assert.ok(content.match(/<\/teiHeader>/))
    });

  });

}
