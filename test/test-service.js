var $ = require;

$('colors');

var domain = $('domain').create();

var started;

domain.on('error', function (error) {
  console.log('dudejs: test failed!'.red.bold, error);
});

domain.run(function () {
  var service = process.argv[2];

  if ( ! service ) {
    throw new Error('Missing service name');
  }

  // create a directory in /tmp to run the test
  var dir = $('path').join('/tmp', 'dudejs-test-' + process.pid.toString() + (+new Date()).toString() + (Math.ceil(Math.random()*7919)).toString());

  $('fs').mkdir(dir, domain.intercept(function () {

    process.chdir(dir);

    $('./tester')({
      'Install': {

        'Installing service': function (callback) {
          $('../lib/install')(service, 'latest', function (error, version) {
            if ( error ) {
              return callback(error);
            }

            var list = $('../list.json');

            var Test;

            list.forEach(function (dep) {
              if ( dep.slug === service ) {
                Test = dep;
              }
            });

            if ( ! Test ) {
              return callback(new Error(service + ' not found in list'));
            }

            if ( version !== Test.latest ) {
              return callback(new Error('Version mismatch, was expecting ' + Test.latest + ', got ' + version));
            }

            var parallelChecks = [];

            parallelChecks.push(function (then) {
              $('fs').stat($('path').join(dir, 'dude-js', 'dependencies', service), then);
            });

            parallelChecks.push(function (then) {
              $('fs').stat($('path').join(dir, 'dude-js', 'dependencies', service, service + '-' + version), then);
            });

            parallelChecks.push(function (then) {
              $('fs').stat($('path').join(dir, 'dude-js', 'dependencies', service, service + '-' + version, 'bin'), then);
            });

            parallelChecks.push(function (then) {
              var json = $($('path').join(dir, 'dude.json'));

              if ( json.dependencies[service] !== version ) {
                callback(new Error('Install did not update dude.json correctly'));
              }

              callback();
            });

            $('async').parallel(parallelChecks, callback);
          });
        }
      },



      'Verifying running services': {
        'Starting service': function (callback) {
          $('../lib/start')(service, {}, function (error, runner) {
            if ( error ) {
              return callback(error);
            }

            if ( typeof runner !== 'object' || runner.constructor !== Object ) {
              return callback(new Error('Runner must be an object'));
            }

            // verify we have a pid
            if ( typeof runner.pid !== 'number' ) {
              return callback(new Error('Missing runner PID'));
            }

            // verify pid is running
            process.kill(runner.pid, 0);

            // verify we have a log
            if ( typeof runner.id !== 'string' ) {
              return callback(new Error('Missing runner id'));
            }

            // some functions to run in parallel
            var parallels = [];

            // verify the log file exits
            parallels.push(function (then) {
              $('fs').stat($('path').join(dir, 'dude-js', 'log', runner.id), then);
            });

            // verify the service file exits
            parallels.push(function (then) {
              $('fs').stat($('path').join(dir, 'dude-js', 'services', runner.id + '.json'), then);
            });

            $('async').parallel(parallels, function (error) {
              if ( error ) {
                return callback(error);
              }
              started = true;
              callback();
            });
          });
        }
      },





      'Verifying stopping services': {
        'Stopping service': function (callback) {
          // get runner information

          $('../lib/running')(function (error, list) {
            if ( error ) {
              return callback(error);
            }

            var service;

            list.forEach(function (item) {
              if ( item.service  === service ) {
                service = item;
              }
            });

            if ( ! service ) {
              throw new Error('Could not stop! Entity not found: ' + service);
            }

            $('../lib/stop')(service.log, function (error) {
              if ( error ) {
                return callback(error);
              }

              // give it some rest
              setTimeout(function () {
                // verify pid is dead
                var isDead = false;

                try {
                  process.kill(service.pid, 0);
                }
                catch ( error ) {
                  isDead = true;
                }

                if ( ! isDead ) {
                  return callback(new Error('PID was not dead'));
                }

                // Check that service has been cleaned
                $('fs').stat($('path').join(dir, 'dude-js', 'services', service.log + '.json'),
                  function (error, stat) {
                    if ( ! error ) {
                      return callback(new Error('Service file has not been cleaned'));
                    }
                    callback();
                  });
              }, 1000 * 2);
            });
          });
        }
      }



    },

    {
      done: function (error) {
        $('fs-extra').removeSync(dir);
      }
    });

  }));
});