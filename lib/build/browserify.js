var $ = require;

module.exports = function (options, callback) {
  var domain = $('domain').create();

  domain.on('error', function (error) {
    callback(error);
  });

  domain.run(function () {
    var json = $($('path').join(process.cwd(), 'dude.json'));

    if ( ! json.build || ! json.build.browserify ) {
      throw new Error('Nothing to browserify');
    }

    var parallels = [];

    var browserify = $('browserify');

    json.build.browserify.forEach(function (build) {
      parallels.push(function () {
        
        var out = $('fs').createWriteStream(this.dest);

        var fn = options.auto ? watchify : browserify;

        var b = fn();

        if ( $('util').isArray(this.source) ) {
          b.add(this.source.map(function (file) {
            return $('path').join(process.cwd(), file);
          }));
        }
        else {
          b.add($('path').join(process.cwd(), this.source));
        }

        b.bundle().pipe(out);

        out.on('end', function () {
          callback();
        });

      }.bind(build));
    });

    $('async').parallel(parallels, callback);
  });
};