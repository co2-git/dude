var $ = require;

module.exports = function (options, callback) {

  var domain = $('domain').create();

  domain.on('error', function (error) {
    callback(error);
  });

  domain.run(function () {
    var json = $($('path').join(process.cwd(), 'dude.json'));

    if ( ! json.build || ! json.build.sass ) {
      throw new Error('Nothing to build upon');
    }

    var parallels = [];

    function sassify (source, dest, success, error) {
      $('node-sass').renderFile({
        file: source,
        outFile: dest,
        outputStyle: 'compressed',
        success: success,
        error: error
      });
    }

    json.build.sass.forEach(function (build) {
      parallels.push(function (cb) {

        if ( options.auto ) {
          sassify(
            $('path').join(process.cwd(), this.source[0]),
            $('path').join(process.cwd(), this.dest),
            function (sassed) {
              console.log('sassified', sassed);
            },
            function (error) {
              console.log('sass error', error);
            }
          );

          var watch = $('fs').watch($('path').join(process.cwd(), this.source[0]),
            function (event, filename) {
              var out = $('fs').createWriteStream($('path').join(process.cwd(), this.dest));
              sassify(
                $('path').join(process.cwd(), this.source[0]),
                $('path').join(process.cwd(), this.dest),
                function (sassed) {
                  console.log('sassified', sassed);
                },
                function (error) {
                  console.log('sass error', error);
                }
              );
            }.bind(this));
        }
        else {
          sassify(
            $('path').join(process.cwd(), this.source[0]),
            $('path').join(process.cwd(), this.dest),
            function (sassed) {
              cb(sassed);
            },
            function (error) {
              cb(new Error(error));
            }
          );
        }

      }.bind(build));
    });

    $('async').parallel(parallels, callback);
  });
};