# base-files-each [![NPM version](https://img.shields.io/npm/v/base-files-each.svg?style=flat)](https://www.npmjs.com/package/base-files-each) [![NPM downloads](https://img.shields.io/npm/dm/base-files-each.svg?style=flat)](https://npmjs.org/package/base-files-each) [![Build Status](https://img.shields.io/travis/node-base/base-files-each.svg?style=flat)](https://travis-ci.org/node-base/base-files-each)

Base plugin for iterating over an array of 'files' objects in a declarative configuration and writing them to the file system.

## Install

Install with [npm](https://www.npmjs.com/):

```sh
$ npm install --save base-files-each
```

## Usage

```js
var files = require('base-files-each');
```

## Example

```js
var expand = require('expand-files');
var Base = require('base');
var pipeline = require('base-pipeline');
var each = require('base-files-each');
var vfs = require('base-fs');
var app = new Base();

app.use(pipeline());
app.use(each());
app.use(vfs());

// register pipeline plugins using the `.plugin` method
app.plugin('foo', function(options) {
  return through.obj(function(file, enc, next) {
    // do plugin stuff 
    next(null, file);
  });
});

// use `expand-files` to expand a declarative configuration object
config = expand({
  cwd: fixtures,
  src: '*.txt',
  dest: actual
});

// pass the config object to `.each()`
app.each(config)
  .on('end', function() {
    console.log('done!');
  });
```

## API

### [.each](index.js#L47)

Iterate over an array of `files` objects in a declarative configuration, optionally run them through a plugin pipline, then write the files to the file system.

**Params**

* `config` **{Object}**
* `cb` **{Function}**: Optional callback function. If callback is not passed, `.eachStream` is called and a stream is returned.

**Example**

```js
var expand = require('expand-files');
var config = expand.config({src: '*', dest: 'foo/'});
generate.each({files: [config]}, function(err) {
  if (err) throw err;
  console.log('done!');
});

// or
generate.each({files: [config]})
  .on('end', function() {
    console.log('done!');
  });
```

### [.eachSeries](index.js#L75)

Generate `files` configurations in series.

**Params**

* `config` **{Object}**
* `cb` **{Function}**

**Example**

```js
var expand = require('expand-files');
var config = expand.config({src: '*', dest: 'foo/'});
generate.eachSeries({files: [config]}, function(err) {
  if (err) throw err;
  console.log('done!');
});
```

### [.eachStream](index.js#L109)

Generate `files` configurations in parallel.

**Params**

* `config` **{Object}**
* `returns` **{Stream}**: returns stream with all process files

**Example**

```js
var expand = require('expand-files');
var config = expand.config({src: '*', dest: 'foo/'});
generate.eachStream({files: [config]}, options)
  .on('error', console.error)
  .on('end', function() {
    console.log('done!');
  });
```

## About

### Related projects

* [base-files-process](https://www.npmjs.com/package/base-files-process): Plugin for processing files from a declarative configuration. | [homepage](https://github.com/node-base/base-files-process "Plugin for processing files from a declarative configuration.")
* [base-fs](https://www.npmjs.com/package/base-fs): base-methods plugin that adds vinyl-fs methods to your 'base' application for working with the file… [more](https://github.com/node-base/base-fs) | [homepage](https://github.com/node-base/base-fs "base-methods plugin that adds vinyl-fs methods to your 'base' application for working with the file system, like src, dest, copy and symlink.")
* [base-pipeline](https://www.npmjs.com/package/base-pipeline): base-methods plugin that adds pipeline and plugin methods for dynamically composing streaming plugin pipelines. | [homepage](https://github.com/node-base/base-pipeline "base-methods plugin that adds pipeline and plugin methods for dynamically composing streaming plugin pipelines.")
* [base-task](https://www.npmjs.com/package/base-task): base plugin that provides a very thin wrapper around [https://github.com/doowb/composer](https://github.com/doowb/composer) for adding task methods to… [more](https://github.com/node-base/base-task) | [homepage](https://github.com/node-base/base-task "base plugin that provides a very thin wrapper around <https://github.com/doowb/composer> for adding task methods to your application.")
* [base](https://www.npmjs.com/package/base): base is the foundation for creating modular, unit testable and highly pluggable node.js applications, starting… [more](https://github.com/node-base/base) | [homepage](https://github.com/node-base/base "base is the foundation for creating modular, unit testable and highly pluggable node.js applications, starting with a handful of common methods, like `set`, `get`, `del` and `use`.")

### Contributing

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](../../issues/new).

### Building docs

_(This document was generated by [verb-generate-readme](https://github.com/verbose/verb-generate-readme) (a [verb](https://github.com/verbose/verb) generator), please don't edit the readme directly. Any changes to the readme must be made in [.verb.md](.verb.md).)_

To generate the readme and API documentation with [verb](https://github.com/verbose/verb):

```sh
$ npm install -g verb verb-generate-readme && verb
```

### Running tests

Install dev dependencies:

```sh
$ npm install -d && npm test
```

### Author

**Jon Schlinkert**

* [github/jonschlinkert](https://github.com/jonschlinkert)
* [twitter/jonschlinkert](http://twitter.com/jonschlinkert)

### License

Copyright © 2016, [Jon Schlinkert](https://github.com/jonschlinkert).
Released under the [MIT license](https://github.com/node-base/base-files-each/blob/master/LICENSE).

***

_This file was generated by [verb](https://github.com/verbose/verb), v0.9.0, on July 18, 2016._