var $ = require;

module.exports = function (callback) {
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

    json.build.sass.forEach(function (build) {
      parallels.push(function () {
        $('node-sass').renderFile({
          file: this.source,
          outFile: this.dest,
          outputStyle: 'compressed',
          success: function () {
            console.log(arguments);
          },
          error: callback
        });
      }.bind(build));
    });

    $('async').parallel(parallels, callback);
  });
};