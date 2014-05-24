var $ = require;

module.exports = function (tarball, target, callback) {
  var domain = $('domain').create();

  domain.on('error', function (error) {
    callback(error);
  });

  domain.run(function () {
    console.log(('  Extracting tarball ' + tarball.bold + ' to ' + target.bold).grey);

    var out = '';
    var err = '';

    var spawn = $('child_process').spawn('tar', ['xzf',
      tarball, '-C', target]);

    spawn.on('error', domain.intercept(function () {}));

    spawn.on('exit', function (code) {
      if ( typeof code === 'number' ) {
        if ( ! code ) {
          return callback();
        }
      }
      return callback(new Error('Got code/signal ' + code + ',' + (err || out)));
    });

    spawn.stdout.on('data', function (data) {
      if ( data ) {
        out += data.toString();
      }
    });

    spawn.stderr.on('data', function (data) {
      if ( data ) {
        err += data.toString();
      }
    });
  });
};