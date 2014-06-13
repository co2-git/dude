var $ = require;

module.exports = function (callback) {
  var domain = $('domain').create();

  domain.on('error', function (error) {
    callback(error);
  });

  domain.run(function () {
    var json = $($('path').join(process.cwd(), 'dude.json'));

    if ( ! json.build || ! json.build.uglify ) {
      throw new Error('Nothing to uglify');
    }

    var parallels = [];

    var uglify = $('uglify-js');

    json.build.uglify.forEach(function (build) {
      parallels.push(function () {

        var source;

        if ( $('util').isArray(this.source) ) {
          source = this.source.map(function (file) {
            return $('path').join(process.cwd(), file);
          });
        }
        else {
          source = $('path').join(process.cwd(), this.source);
        }
        
        var stream = $('fs').createWriteStream($('path').join(process.cwd(), this.dest));

        stream.write(uglify.minify(source).code);

        stream.on('end', function () {
          callback();
        });

      }.bind(build));
    });

    $('async').parallel(parallels, callback);
  });
};