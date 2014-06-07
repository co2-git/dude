var $ = require;

$('colors');

var domain = $('domain').create();

var started;

domain.on('error', function (error) {
  console.log('dudejs: test failed!'.red.bold, error);
});

domain.run(function () {

  // create a directory in /tmp to run the test
  var dir = $('path').join('/tmp', 'dudejs-test-' + process.pid.toString() + (+new Date()).toString() + (Math.ceil(Math.random()*7919)).toString());

  $('fs').mkdir(dir, domain.intercept(function () {

    process.chdir(dir);

    $('./tester')({
      'Start': {

        'Starting script': function (callback) {
          $('../lib/init')(function (error) {
            if ( error ) {
              return callback(error);
            }
            console.log();
            $('../lib/start-script')($('path').join(__dirname, 'server.js'), function (error, script) {
              if ( error ) {
                return callback(error);
              }

              if ( script.constructor !== Object ) {
                return callback(new Error('Script must be an object'));
              }

              if ( typeof script.pid !== 'number' ) {
                return callback(new Error('Missing script pid'));
              }

              if ( typeof script.id !== 'string' ) {
                return callback(new Error('Missing script id'));
              }

              try {
                process.kill(script.pid, 0);
              }
              catch ( error ) {
                return callback(new Error('pid not found'));
              }

              var parallels = [];

              parallels.push(function (cb) {
                $('fs').stat($('path').join(dir, 'dude-js', 'log', script.id), cb);
              });

              parallels.push(function (cb) {
                $('fs').stat($('path').join(dir, 'dude-js', 'services', script.id + '.json'), cb);
              });

              $('async').parallel(parallels, callback);
            });
          });
        }
      },



      // 'Verifying running services': {
      //   'Starting service': function (callback) {
      //     $('../lib/start')(service, {}, function (error, runner) {
      //       if ( error ) {
      //         return callback(error);
      //       }

      //       if ( typeof runner !== 'object' || runner.constructor !== Object ) {
      //         return callback(new Error('Runner must be an object'));
      //       }

      //       // verify we have a pid
      //       if ( typeof runner.pid !== 'number' ) {
      //         return callback(new Error('Missing runner PID'));
      //       }

      //       // verify pid is running
      //       process.kill(runner.pid, 0);

      //       // verify we have a log
      //       if ( typeof runner.id !== 'string' ) {
      //         return callback(new Error('Missing runner id'));
      //       }

      //       // some functions to run in parallel
      //       var parallels = [];

      //       // verify the log file exits
      //       parallels.push(function (then) {
      //         $('fs').stat($('path').join(dir, 'dude-js', 'log', runner.id), then);
      //       });

      //       // verify the service file exits
      //       parallels.push(function (then) {
      //         $('fs').stat($('path').join(dir, 'dude-js', 'services', runner.id + '.json'), then);
      //       });

      //       $('async').parallel(parallels, function (error) {
      //         if ( error ) {
      //           return callback(error);
      //         }
      //         started = true;
      //         callback();
      //       });
      //     });
      //   }
      // },





      // 'Verifying stopping services': {
      //   'Stopping service': function (callback) {
      //     // get runner information

      //     $('../lib/running')(function (error, list) {
      //       if ( error ) {
      //         return callback(error);
      //       }

      //       var service;

      //       list.forEach(function (item) {
      //         if ( item.service  === service ) {
      //           service = item;
      //         }
      //       });

      //       if ( ! service ) {
      //         throw new Error('Could not stop! Entity not found: ' + service);
      //       }

      //       $('../lib/stop')(service.log, function (error) {
      //         if ( error ) {
      //           return callback(error);
      //         }

      //         // give it some rest
      //         setTimeout(function () {
      //           // verify pid is dead
      //           var isDead = false;

      //           try {
      //             process.kill(service.pid, 0);
      //           }
      //           catch ( error ) {
      //             isDead = true;
      //           }

      //           if ( ! isDead ) {
      //             return callback(new Error('PID was not dead'));
      //           }

      //           // Check that service has been cleaned
      //           $('fs').stat($('path').join(dir, 'dude-js', 'services', service.log + '.json'),
      //             function (error, stat) {
      //               if ( ! error ) {
      //                 return callback(new Error('Service file has not been cleaned'));
      //               }
      //               callback();
      //             });
      //         }, 1000 * 2);
      //       });
      //     });
      //   }
      // }



    },

    {
      done: function (error) {
        $('fs-extra').removeSync(dir);
      }
    });

  }));
});