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

  it('should return a link to the root collection', function() {
    return request(app)
      .get('/')
      .then(function(response) {
        assert.equal(response.status, 200)
        collectionUrl = response.body.collections
        assert.ok(typeof collectionUrl === 'string')
      })
  });

  let firstCollectionMember = null

  it('should have a collection with one member with an @id', function() {
    return request(app)
      .get(collectionUrl)
      .then(function(response) {
        assert.equal(response.status, 200)
        firstCollectionMember = response.body.member[0]
        console.log(firstCollectionMember)
        assert.ok(typeof firstCollectionMember['@id'] === 'string')
      })
  });


    it('should have a document with references / navigation', function() {
      console.log(firstCollectionMember['dts:references'])
      return request(app)
        .get(firstCollectionMember['dts:references'])
        .then(function(response) {
          assert.equal(response.status, 200)
          // firstCollectionMember = response.body.member[0]
          // assert.ok(typeof firstCollectionMember['@id'] === 'string')
        })
    });
});
