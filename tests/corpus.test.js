const assert = require('assert');
const expect = require('chai').expect
const Corpus = require('../controllers/corpus-github')

/*
TODO:

*/

const source = "tests/corpus"
// const source = "https://github.com/kingsdigitallab/alice-thornton/tree/edition/texts"
// https://api.github.com/repos/kingsdigitallab/alice-thornton/git/trees/edition?recursive=1
// 
// https://api.github.com/repos/TU-plogan/kp-editions/git/trees/main?recursive=1

describe('Unit testing Corpus class', function() {

  let corpus = null
  let root = null

  it('should instantiate from an address', function() {
    corpus = new Corpus(source)
    assert.ok(corpus)
  });

  it('return a root collection', async function() {
    await corpus.buildAndSaveTree(true)
    root = corpus.getItem()
    assert.ok(root)
    assert.ok(root.totalParents === 0)
  });

  it('return two documents under the root collection', function() {
    let items = corpus.getSubItems()
    assert.equal(items.length, 2)
  });

  it('return two documents under the root collection', function() {
    let item = corpus.getItemAndSubItems()
    console.log(item)
    assert.equal(item.member.length, 2)
  });

});
