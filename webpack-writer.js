const path = require('path');
const RSVP = require('rsvp');
const CachingWriter = require('broccoli-caching-writer');
const Webpack = require('webpack');

WebpackWriter.prototype = Object.create(CachingWriter.prototype);

WebpackWriter.prototype.constructor = WebpackWriter;

function WebpackWriter(inputNodes, options) {
  options = options || {};
  CachingWriter.call(this, inputNodes, {
    annotation: options.annotation,
  });
  this.options = options;
}

WebpackWriter.prototype.build = function () {
  return RSVP.all(
    this.inputPaths.map(
      function (srcDir) {
        this.options.context = path.resolve(srcDir);
        this.options.output = this.options.output || {};
        this.options.output.path = this.outputPath;

        // Add default babel configuration for Node 12
        // this.options.module = this.options.module || {};
        // this.options.module.rules = this.options.module.rules || [];
        // this.options.module.rules.push({
        //   test: /\.js$/,
        //   exclude: /node_modules/,
        //   use: {
        //     loader: 'babel-loader',
        //     options: {
        //       presets: [
        //         ['@babel/preset-env', {
        //           targets: {
        //             node: '12'
        //           }
        //         }]
        //       ]
        //     }
        //   }
        // });

        var compiler = Webpack(this.options);

        return new RSVP.Promise(function (resolve, reject) {
          compiler.run(function (err, stats) {
            var jsonStats = stats.toJson();

            if (jsonStats.errors.length > 0) {
              jsonStats.errors.forEach(console.error);
            }

            if (jsonStats.warnings.length > 0) {
              jsonStats.warnings.forEach(console.warn);
            }

            if (err || jsonStats.errors.length > 0) {
              reject(err);
            } else {
              resolve();
            }
          });
        });
      }.bind(this)
    )
  );
};

module.exports = WebpackWriter;
