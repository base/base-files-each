/*!
 * base-files-each (https://github.com/node-base/base-files-each)
 *
 * Copyright (c) 2016, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var debug = require('debug')('base-files-each');
var utils = require('./utils');

module.exports = function(config) {
  return function(app) {
    if (!utils.isValid(app, 'base-files-each')) return;

    /**
     * Plugins
     */

    this.use(utils.files());

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
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }
      if (typeof cb !== 'function') {
        return app.eachStream(config, options);
      }
      return app.eachSeries(config, options, cb);
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
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }

      config.options = utils.merge({data: {}}, config.options);

      utils.eachSeries(config.files, function(files, next) {
        var opts = utils.merge({}, config.options, files.options, options);
        app.processFiles(files, opts)
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
      config.options = utils.merge({data: {}}, config.options);
      var streams = [];

      config.files.forEach(function(files) {
        var opts = utils.merge({}, config.options, files.options, options);
        streams.push(app.processFiles(files, opts));
      });

      var stream = utils.ms.apply(utils.ms, streams);
      stream.on('finish', function() {
        if (stream._events.data) return;
        stream.emit.bind(stream, 'end').apply(stream, arguments);
      });
      return stream;
    });
  };
};
