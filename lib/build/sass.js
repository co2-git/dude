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

    for ( var dest in json.build.sass ) {
      parallels.push(function () {
        var dest = this.dest;
        var source = this.source;

        $('node-sass').renderFile({
          file: dest,
          outFile: source,
          outputStyle: 'compressed',
          success: function () {
            console.log(arguments);
          },
          error: callback
        });
      }.bind({ dest: dest, source: json.build.sass[dest] }));
    }

    $('async').parallel(parallels, callback);
  });
};