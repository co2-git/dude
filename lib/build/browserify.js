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

    // Bundle Watchify
    function bundleW (w, dest) {
      var wb = w.bundle();

      var bytes, time;

      wb.on('error', function (error) {
        console.log('wb error', error);
      });

      wb.pipe($('fs').createWriteStream(dest));

      w.on('bytes', function (b) {
        bytes = b;
      });
      
      w.on('time', function (t) {
        time = t;
      });

      wb.on('end', function () {
        console.log('watchified OK', { dest: dest, seconds: +((time / 1000).toFixed(2)), bytes: bytes });
      });
    }

    var parallels = [];

    json.build.browserify.forEach(function (build) {
      parallels.push(function (cb) {

        // If auto, use watchify
        if ( options.auto ) {
          var w;

          if ( $('util').isArray(this.source) ) {
            w = $('watchify')($('browserify')(this.source.map(function (file) {
              return $('path').join(process.cwd(), file);
            })));
          }
          else {
            w = $('watchify')($('browserify')($('path').join(process.cwd(), this.source)));
          }

          var dest = this.dest;

          w.on('update', function () {
            bundleW(this.w, this.dest);
          }.bind({ w: w, dest: dest }));

          w.on('error', function (error) {
            console.log('error', error);
          });

          bundleW(w, dest);
        }

        // otehrwise use browserify
        else {
          var out = $('fs').createWriteStream(this.dest);

          var b = $('browserify')();

          if ( $('util').isArray(this.source) ) {
            b.add(this.source.map(function (file) {
              return $('path').join(process.cwd(), file);
            }));
          }

          else {
            b.add($('path').join(process.cwd(), this.source));
          }

          b.bundle().pipe(out);

          out.on('finish', function () {
            cb(null, this);
          }.bind(this));
        }

      }.bind(build));
    });

    $('async').parallel(parallels, callback);
  });
};