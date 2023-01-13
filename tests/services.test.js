const assert = require('assert');
const expect = require('chai').expect
const request = require('supertest');
const app = require('../server')

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
        assert.ok(typeof firstCollectionMember['@id'] === 'string')
      })
  });

});
