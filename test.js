'use strict';

require('mocha');
var fs = require('fs');
var path = require('path');
var assert = require('assert');
var rimraf = require('rimraf');
var through = require('through2');
var expandFiles = require('expand-files');
var pipeline = require('base-pipeline');
var files = require('base-files-process');
var option = require('base-option');
var data = require('base-data');
var vfs = require('base-fs');
var App = require('base');
var scaffold;
var config;
var app;

var fixtures = path.join(__dirname, 'fixtures');
var actual = path.join(__dirname, 'actual');

function expand(options) {
  var config = expandFiles();
  config.expand(options);
  return config.files[0];
}

function output(name) {
  return path.join(actual, name);
}

function exists(name) {
  try {
    fs.statSync(output(name));
    return true;
  } catch (err) {}
  return false;
}

function base(cb) {
  return through.obj(function(file, enc, next) {
    var str = file.contents.toString();
    cb(file, str, next);
  });
}


describe('process()', function() {
  beforeEach(function(cb) {
    app = new App();
    app.isApp = true;
    app.use(option());
    app.use(data());
    app.use(vfs());
    app.use(pipeline());
    app.use(files());
    app.use(require('./')());
    rimraf(actual, cb);
  });

  afterEach(function(cb) {
    rimraf(actual, cb);
  });

  describe('setup', function() {
    it('should clean out all test fixtures', function(cb) {
      assert(!exists(actual));
      cb();
    });
  });
});

describe('.each', function() {
  beforeEach(function(cb) {
    app = new App();
    app.isApp = true;
    app.use(option());
    app.use(data());
    app.use(vfs());
    app.use(pipeline());
    app.use(files());
    app.use(require('./')());
    rimraf(actual, cb);
  });

  afterEach(function(cb) {
    rimraf(actual, cb);
  });

  describe('.each callback', function() {
    it('should use a plugin to modify file contents', function(cb) {
      app.plugin('append', function(opts) {
        opts = opts || {};
        return base(function(file, str, next) {
          file.contents = new Buffer(str + opts.suffix);
          next(null, file);
        });
      });

      config = expand({
        cwd: fixtures,
        src: '*.txt',
        dest: actual
      });

      app.each({files: [config]}, {suffix: 'zzz'}, function(err) {
        if (err) return cb(err);
        assert(exists('example.txt'));
        cb();
      });
    });
  });

  describe('.each streams', function() {
    it('should use a plugin to modify file contents', function(cb) {
      app.plugin('append', function(opts) {
        opts = opts || {};
        return base(function(file, str, next) {
          file.contents = new Buffer(str + opts.suffix);
          next(null, file);
        });
      });

      var count = 0;
      config = expand({
        cwd: fixtures,
        src: '*.txt',
        dest: actual
      });

      app.each({files: [config]}, {suffix: 'zzz'})
        .on('error', cb)
        .on('data', function(data) {
          count++;
          var str = data.contents.toString();
          var end = str.slice(-3);
          assert.equal(end, 'zzz');
        })
        .on('end', function() {
          assert(exists('example.txt'));
          assert.equal(count, 4);
          cb();
        });
    });

    it('should run plugins defined on config.options', function(cb) {
      function appendString(suffix) {
        return base(function(file, str, next) {
          file.contents = new Buffer(str + suffix);
          next(null, file);
        });
      }

      app.plugin('a', appendString('aaa'));
      app.plugin('b', appendString('bbb'));
      app.plugin('c', appendString('ccc'));

      config = expand({
        options: {pipeline: ['a', 'c']},
        cwd: fixtures,
        src: 'a.txt',
        dest: actual
      });

      app.each({files: [config]}, {suffix: 'zzz'})
        .on('error', cb)
        .on('data', function(data) {
          var str = data.contents.toString();
          assert.equal(str.indexOf('bbb'), -1);
          var end = str.slice(-6);
          assert.equal(end, 'aaaccc');
        })
        .on('end', function() {
          assert(exists('a.txt'));
          cb();
        });
    });

    it('should run plugins defined on process.options', function(cb) {
      function appendString(suffix) {
        return base(function(file, str, next) {
          file.contents = new Buffer(str + suffix);
          next(null, file);
        });
      }

      app.plugin('a', appendString('aaa'));
      app.plugin('b', appendString('bbb'));
      app.plugin('c', appendString('ccc'));

      config = expand({
        cwd: fixtures,
        src: 'a.txt',
        dest: actual
      });

      app.each({files: [config]}, {pipeline: ['a', 'c'], suffix: 'zzz'})
        .on('error', cb)
        .on('data', function(data) {
          var str = data.contents.toString();
          assert.equal(str.indexOf('bbb'), -1);
          var end = str.slice(-6);
          assert.equal(end, 'aaaccc');
        })
        .on('end', function() {
          assert(exists('a.txt'));
          cb();
        });
    });

    it('should process files from the process options.cwd', function(cb) {
      config = expand({src: 'b.txt', dest: actual, cwd: fixtures});

      app.each({files: [config]}, {cwd: fixtures})
        .on('error', cb)
        .on('end', function() {
          assert(exists('b.txt'));
          cb();
        });
    });

    it('should use the cwd passed on the config.options.cwd', function(cb) {
      assert(!exists('b.txt'));

      config = expand({
        cwd: fixtures,
        src: 'b.txt',
        dest: actual
      });

      app.each({files: [config]})
        .on('error', cb)
        .on('end', function() {
          assert(exists('b.txt'));
          cb();
        });
    });

    it('should work with no options:', function(cb) {
      config = expand({src: 'b.txt', dest: actual, cwd: fixtures});
      app.each({files: [config]})
        .on('error', cb)
        .on('end', function() {
          assert(exists('b.txt'));
          cb();
        });
    });

    it('should process a single file', function(cb) {
      assert(!exists('a.txt'));

      config = expand({
        cwd: fixtures,
        src: 'a.txt',
        dest: actual
      });

      app.each({files: [config]})
        .on('error', cb)
        .on('end', function() {
          assert(exists('a.txt'));
          cb();
        });
    });

    it('should process a glob of files', function(cb) {
      assert(!exists('a.txt'));
      assert(!exists('b.txt'));
      assert(!exists('c.txt'));

      config = expand({
        cwd: fixtures,
        src: '*.txt',
        dest: actual
      });

      app.each({files: [config]})
        .on('error', cb)
        .on('end', function() {
          assert(exists('a.txt'));
          assert(exists('b.txt'));
          assert(exists('c.txt'));
          cb();
        });
    });
  });
});

describe('.eachSeries', function() {
  beforeEach(function(cb) {
    app = new App();
    app.isApp = true;
    app.use(option());
    app.use(data());
    app.use(vfs());
    app.use(pipeline());
    app.use(files());
    app.use(require('./')());
    rimraf(actual, cb);
  });

  afterEach(function(cb) {
    rimraf(actual, cb);
  });

  it('should use a plugin to modify file contents', function(cb) {
    app.plugin('append', function(opts) {
      opts = opts || {};
      return base(function(file, str, next) {
        file.contents = new Buffer(str + opts.suffix);
        next(null, file);
      });
    });

    config = expand({
      cwd: fixtures,
      src: '*.txt',
      dest: actual
    });

    app.eachSeries({files: [config]}, {suffix: 'zzz'}, function(err) {
      if (err) return cb(err);
      assert(exists('example.txt'));
      cb();
    });
  });
});

describe('.eachStream', function() {
  beforeEach(function(cb) {
    app = new App();
    app.isApp = true;
    app.use(option());
    app.use(data());
    app.use(vfs());
    app.use(pipeline());
    app.use(files());
    app.use(require('./')());
    rimraf(actual, cb);
  });

  afterEach(function(cb) {
    rimraf(actual, cb);
  });

  describe('setup', function() {
    it('should clean out all test fixtures', function(cb) {
      assert(!exists(actual));
      cb();
    });
  });

  describe('streams', function() {
    it('should process files from the process options.cwd', function(cb) {
      config = expand({src: 'b.txt', dest: actual, cwd: fixtures});

      app.eachStream({files: [config]}, {cwd: fixtures})
        .on('error', cb)
        .on('end', function() {
          assert(exists('b.txt'));
          cb();
        });
    });

    it('should use the cwd passed on the config.options.cwd', function(cb) {
      assert(!exists('b.txt'));

      config = expand({
        cwd: fixtures,
        src: 'b.txt',
        dest: actual
      });

      app.eachStream({files: [config]})
        .on('error', cb)
        .on('end', function() {
          assert(exists('b.txt'));
          cb();
        });
    });

    it('should work with no options:', function(cb) {
      config = expand({src: 'b.txt', dest: actual, cwd: fixtures});
      app.eachStream({files: [config]})
        .on('error', cb)
        .on('end', function() {
          assert(exists('b.txt'));
          cb();
        });
    });

    it('should process a single file', function(cb) {
      assert(!exists('a.txt'));

      config = expand({
        cwd: fixtures,
        src: 'a.txt',
        dest: actual
      });

      app.eachStream({files: [config]})
        .on('error', cb)
        .on('end', function() {
          assert(exists('a.txt'));
          cb();
        });
    });

    it('should process a glob of files', function(cb) {
      assert(!exists('a.txt'));
      assert(!exists('b.txt'));
      assert(!exists('c.txt'));

      config = expand({
        cwd: fixtures,
        src: '*.txt',
        dest: actual
      });

      app.eachStream({files: [config]})
        .on('error', cb)
        .on('end', function() {
          assert(exists('a.txt'));
          assert(exists('b.txt'));
          assert(exists('c.txt'));
          cb();
        });
    });
  });
});
