/* jshint node: true */
'use strict';

const path = require('path');
const BroccoliMergeTrees = require('broccoli-merge-trees');
const resolve = require('resolve');
const WebpackWriter = require('./webpack-writer');

module.exports = {
  name: 'emberfire',

  included() {
    this._super.included.apply(this, arguments);
    let app;

    console.log('emberfire included');

    // If the addon has the _findHost() method (in ember-cli >= 2.7.0), we'll just
    // use that.
    if (typeof this._findHost === 'function') {
      app = this._findHost();
    } else {
      // Otherwise, we'll use this implementation borrowed from the _findHost()
      // method in ember-cli.
      let current = this;
      do {
        app = current.app || app;
      } while (current.parent.parent && (current = current.parent));
    }

    this.app.import('vendor/firebase.amd.js');
    this.app.import('vendor/shims/firebase.js');
  },

  treeForVendor: function(tree) {
    let trees = [];

    let firebasePath = this.pathBase('firebase');

    trees.push(new WebpackWriter([
      firebasePath
    ], {
      entry: './firebase-browser.js',
      output: {
        library: 'firebase',
        libraryTarget: 'amd',
        filename: 'firebase.amd.js'
      }
    }));

    if (tree) {
      console.log('tree', tree);
      trees.push(tree);
    }

    return BroccoliMergeTrees(trees, { overwrite: true });
  },

  /*
    Rely on the `resolve` package to mimic node's resolve algorithm.
    It finds the modules in a manner that works for npm 2.x,
    3.x, and yarn in both the addon itself and projects that depend on this addon.
    This is an edge case b/c some modules do not have a main
    module we can require.resolve through node itself and similarily ember-cli
    does not have such a hack for the same reason.
  */
  pathBase(packageName) {
    return path.dirname(resolve.sync(`${packageName}/package.json`, { basedir: __dirname }));
  },

  isDevelopingAddon() {
    return false;
  },
};
