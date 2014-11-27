
module.exports = function (callback) {
  var domain = require('domain').create();

  domain.on('error', function (error) {
    callback(error);
  });

  domain.run(function () {
    var json = require(require('path').join(process.cwd(), 'dude.json'));

    if ( ! json.build || ! json.build.uglify ) {
      throw new Error('Nothing to uglify');
    }

    var parallels = [];

    var uglify = require('uglify-js');

    json.build.uglify.forEach(function (build) {
      parallels.push(function () {

        var source;

        if ( require('util').isArray(this.source) ) {
          source = this.source.map(function (file) {
            return require('path').join(process.cwd(), file);
          });
        }
        else {
          source = require('path').join(process.cwd(), this.source);
        }
        
        var stream = require('fs').createWriteStream(require('path').join(process.cwd(), this.dest));

        stream.write(uglify.minify(source).code);

        stream.on('end', function () {
          callback();
        });

      }.bind(build));
    });

    require('async').parallel(parallels, callback);
  });
};