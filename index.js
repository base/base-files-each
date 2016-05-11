/*!
 * base-files-each (https://github.com/node-base/base-files-each)
 *
 * Copyright (c) 2016, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var debug = require('debug')('base-files-each');

module.exports = function(config) {
  return function(app) {
    if (this.isRegistered('base-files-each')) return;
    debug('initializing "%s", from "%s"', __filename, module.parent.id);

    this.define('each', function() {
      debug('running each');
      
    });
  };
};
