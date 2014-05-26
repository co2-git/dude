var $ = require;

module.exports = function (callback) {
  var domain = $('domain').create();

  domain.on('error', function (error) {
    callback(error);
  });

  domain.run(function () {
    $('fs').readdir($('path').join(process.env.PWD, 'dude-js', 'services'),
      domain.intercept(function (files) {
        if ( ! files.length ) {
          return callback(null, []);
        }

        var running = [];
        
        files.forEach(function (file) {
          running.push($($('path').join(process.env.PWD, 'dude-js', 'services', file)));
        });

        callback(null, running);
      }));
  });
};