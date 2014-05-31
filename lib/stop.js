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
    if ( typeof runner === 'undefined' ) {
      throw new Error('Missing entity to stop');
    }

    var signal = options.signal || 'SIGTERM';

    function stop (runner, cb) {
      if ( runner.zombie ) {
        $('fs').unlink($('path').join(process.env.PWD, 'dude-js', 'services', runner.log + '.json'),
          domain.intercept(function () {
            cb(null, runner);
          }));
      }

      else {
        process.kill(runner.pid, signal);

        cb();
      }
    }

    $('./running')(domain.intercept(function (running) {
      if ( runner === true ) {
        var p = [];

        running.forEach(function (runner) {
          p.push(function (cb) {
            stop(this, function () {
              cb(null, this);
            }.bind(this));
          }.bind(runner));
        });

        $('async').parallel(p, callback);
      }

      else {
        var service;

        running.forEach(function (item) {
          if ( item.log === runner ) {
            service = item;
          }
        });

        if ( ! service ) {
          throw new Error('Could not stop! Entity not found: ' + runner);
        }

        stop(service, function () {
          callback(null, [service]);
        });
      }
    }));
  });
};