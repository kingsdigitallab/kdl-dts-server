const assert = require('assert');
const expect = require('chai').expect
const request = require('supertest');
const app = require('../server')
const mocha = require('mocha')

/*
TODO:

M add test corpus (2 dummy TEI files)
M test all entry points: /, /documents/, collection/, navigation/
M stop if describe block fails
S test additional fields in the responses

*/


describe('Unit testing the / route', function() {

  let collectionUrl = ''
  let documentUrl = ''

  it('should return a link to the root collection', function() {
    return request(app)
      .get('/')
      .then(function(response) {
        assert.equal(response.status, 200)
        collectionUrl = response.body.collections
        assert.ok(typeof collectionUrl === 'string')
        documentUrl = response.body.documents
        assert.ok(typeof documentUrl === 'string')
      })
  });

  let firstCollectionMember = null

  it('should have a collection with one member with an @id', function() {
    return request(app)
      .get(collectionUrl)
      .then(function(response) {
        assert.equal(response.status, 200)
        firstCollectionMember = response.body.member[0]
        // console.log(firstCollectionMember)
        assert.ok(typeof firstCollectionMember['@id'] === 'string')
      })
  });

  let passage = null;
  it('should have a document with references / navigation', function() {
    // console.log(firstCollectionMember['dts:references'])
    return request(app)
      .get(firstCollectionMember['dts:references'])
      .then(function(response) {
        assert.equal(response.status, 200)
        assert.ok(response.body.member)
        passage = response.body.member[0]
        // console.log(passage)
        assert.ok(passage['ref'] || passage['dts:ref'])
      })
  });

  let references = []

  it('should return first passage of first TEI doc in top collection', function() {
    let url = `${documentUrl}?id=${firstCollectionMember['@id']}&ref=${passage['dts:ref']}`
    // console.log(url)
    return request(app)
      .get(url)
      .then(function(response) {
        assert.equal(response.status, 200)
        assert.ok(response.text)
        assert.ok(response.text.match(/<TEI/))
      })
  });

  it('should return first passage of first HTML doc in top collection', function() {
    let url = `${documentUrl}?id=${firstCollectionMember['@id']}&ref=${passage['dts:ref']}&format=html`
    // console.log(url)
    return request(app)
      .get(url)
      .then(function(response) {
        assert.equal(response.status, 200)
        assert.ok(response.text)
        assert.ok(response.text.match(/<(div|span)/))
      })
  });

});
