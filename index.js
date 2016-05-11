/*!
 * base-files-each (https://github.com/node-base/base-files-each)
 *
 * Copyright (c) 2016, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var async = require('async');
var debug = require('debug')('base-files-each');
var merge = require('mixin-deep');
var ms = require('merge-stream');

module.exports = function(config) {
  return function(app) {
    if (!this.isApp || this.isRegistered('base-files-each')) return;
    debug('initializing "%s", from "%s"', __filename, module.parent.id);

    /**
     * Iterate over an array of `files` objects in a declarative configuration, optionally
     * run them through a plugin pipline, then write the files to the file system.
     *
     * ```js
     * var expand = require('expand-files');
     * var config = expand.config({src: '*', dest: 'foo/'});
     * generate.each({files: [config]}, function(err) {
     *   if (err) throw err;
     *   console.log('done!');
     * });
     *
     * // or
     * generate.each({files: [config]})
     *   .on('end', function() {
     *     console.log('done!');
     *   });
     * ```
     * @name .each
     * @param {Object} `config`
     * @param {Function} `cb` Optional callback function. If callback is not passed, `.eachStream` is called and a stream is returned.
     * @api public
     */

    this.define('each', function(config, options, cb) {
      verifyPlugins(app);

      if (typeof options === 'function') {
        cb = options;
        options = {};
      }

      if (typeof cb !== 'function') {
        return app.eachStream.call(app, config, options);
      }

      config = merge({options: {data: {}}, data: {}}, config);
      options = merge({}, config.options, options);

      async.each(config.files, function(files, next) {
        app.process(files, options)
          .on('error', next)
          .on('end', next);
      }, cb);
      return app;
    });

    /**
     * Generate `files` configurations in series.
     *
     * ```js
     * var expand = require('expand-files');
     * var config = expand.config({src: '*', dest: 'foo/'});
     * generate.eachSeries({files: [config]}, function(err) {
     *   if (err) throw err;
     *   console.log('done!');
     * });
     * ```
     * @name .eachSeries
     * @param {Object} `config`
     * @param {Function} `cb`
     * @api public
     */

    this.define('eachSeries', function(config, options, cb) {
      verifyPlugins(app);

      if (typeof options === 'function') {
        cb = options;
        options = {};
      }

      config = merge({options: {data: {}}, data: {}}, config);
      options = merge({}, config.options, options);

      async.eachSeries(config.files, function(files, next) {
        app.process(files, options)
          .on('error', next)
          .on('end', next);
      }, cb);
    });

    /**
     * Generate `files` configurations in parallel.
     *
     * ```js
     * var expand = require('expand-files');
     * var config = expand.config({src: '*', dest: 'foo/'});
     * generate.eachStream({files: [config]}, options)
     *   .on('error', console.error)
     *   .on('end', function() {
     *     console.log('done!');
     *   });
     * ```
     * @name .eachStream
     * @param {Object} `config`
     * @return {Stream} returns stream with all process files
     * @api public
     */

    this.define('eachStream', function(config, options) {
      verifyPlugins(app);

      config = merge({options: {data: {}}, data: {}}, config);
      options = merge({}, config.options, options);

      var streams = [];

      config.files.forEach(function(files) {
        streams.push(app.process(files, options));
      });

      var stream = ms.apply(ms, streams);
      stream.on('finish', function() {
        if (stream._events.data) return;
        stream.emit.bind(stream, 'end').apply(stream, arguments);
      });
      return stream;
    });
  };
};

function verifyPlugins(app) {
  if (typeof app.process !== 'function') {
    throw new Error('expected the base-files-process plugin to be registered');
  }
}
