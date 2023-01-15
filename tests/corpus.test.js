const assert = require('assert');
const expect = require('chai').expect
const Corpus = require('../controllers/corpus')

/*
TODO:

*/

const source = "tests/collection"

describe('Unit testing Corpus class', function() {

  let corpus = null
  let root = null

  it('should instantiate from directory argument', function() {
    corpus = new Corpus(source, true)
    assert.ok(corpus)
  });

  it('return a root collection', function() {
    root = corpus.getItem()
    assert.ok(root)
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
