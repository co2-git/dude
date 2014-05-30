var $ = require;

module.exports = function (runner, options, callback) {

  if ( typeof callback === 'undefined' && typeof options === 'function' ) {
    callback = options;
  }

  if ( options.constructor !== Object ) {
    options = {};
  }

  var domain = $('domain').create();

  domain.on('error', function (error) {
    callback(error);
  });

  domain.run(function () {
    if ( typeof runner !== 'string' ) {
      throw new Error('Missing entity to stop');
    }

    var signal = options.signal || 'SIGTERM';

    $('./running')(domain.intercept(function (running) {
      var service;

      running.forEach(function (item) {
        if ( item.log === runner ) {
          service = item;
        }
      });

      if ( ! service ) {
        throw new Error('Could not stop! Entity not found: ' + runner);
      }

      if ( service.zombie ) {
        $('fs').unlink($('path').join(process.env.PWD, 'dude-js', 'services', runner + '.json'),
          domain.intercept(function () {
            callback(null, 'killed zombie');
          }));
      }

      else {
        process.kill(service.pid, signal);

        callback();
      }
    }));
  });
};