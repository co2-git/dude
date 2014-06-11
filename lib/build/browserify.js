var $ = require;

module.exports = function (callback) {
  var domain = $('domain').create();

  domain.on('error', function (error) {
    callback(error);
  });

  domain.run(function () {
    var json = $($('path').join(process.cwd(), 'dude.json'));

    if ( ! json.build || ! json.build.browserify ) {
      throw new Error('Nothing to build upon');
    }

    var parallels = [];

    for ( var source in json.build.browserify ) {
      parallels.push(function () {
        var dest = this.dest;
        var source = this.source;

        var browserify = $('browserify');

        var out = $('fs').createWriteStream(dest);

        var b = browserify();

        b.add($('path').join(process.cwd(), source));

        b.bundle().pipe(out);

        out.on('end', function () {
          console.log(arguments);
        });

      }.bind({ source: source, dest: json.build.browserify[source] }));
    }

    $('async').parallel(parallels, callback);
  });
};