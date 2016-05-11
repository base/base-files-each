'use strict';

require('mocha');
var assert = require('assert');
var each = require('./');

describe('base-files-each', function() {
  it('should export a function', function() {
    assert.equal(typeof each, 'function');
  });

  it('should export an object', function() {
    assert(each);
    assert.equal(typeof each, 'object');
  });

  it('should throw an error when invalid args are passed', function(cb) {
    try {
      each();
      cb(new Error('expected an error'));
    } catch (err) {
      assert(err);
      assert.equal(err.message, 'expected first argument to be a string');
      assert.equal(err.message, 'expected callback to be a function');
      cb();
    }
  });
});
