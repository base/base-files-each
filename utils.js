'use strict';

var utils = require('lazy-cache')(require);
var fn = require;
require = utils;

/**
 * Lazily required module dependencies
 */

require('async-each', 'each');
require('async-each-series', 'eachSeries');
require('is-valid-instance');
require('is-registered');
require('base-files-process', 'files');
require('mixin-deep', 'merge');
require('merge-stream', 'ms');
require = fn;

/**
 * Expose `utils` modules
 */

module.exports = utils;
