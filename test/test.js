var $ = require;

$('colors');

var domain = $('domain').create();

domain.on('error', function (error) {
  console.log('dudejs: test failed!'.red.bold, error);
});

domain.run(function () {
  // create a directory in /tmp to run the test

  var dir = $('path').join('/tmp', 'dudejs-test-' + process.pid.toString() + (+new Date()).toString() + (Math.ceil(Math.random()*7919)).toString());

  $('fs').mkdir(dir, domain.intercept(function () {

    process.chdir(dir);

    $('./tester')({
      'Verifying main libraries': {
        'Verifying init': function (callback) {
          
          $('../lib/init')(function (error) {
            if ( error ) {
              return callback(error);
            }

            var parallelChecks = [];

            // Verify dudejs dir exists
            parallelChecks.push(function (then) {
              $('fs').stat($('path').join(dir, 'dude-js'), then);
            });

            // Verify dependencies dir exists
            parallelChecks.push(function (then) {
              $('fs').stat($('path').join(dir, 'dude-js', 'dependencies'), then);
            });

            // Verify tmp dir exists
            parallelChecks.push(function (then) {
              $('fs').stat($('path').join(dir, 'dude-js', 'tmp'), then);
            });

            // Verify log dir exists
            parallelChecks.push(function (then) {
              $('fs').stat($('path').join(dir, 'dude-js', 'log'), then);
            });

            // Verify services dir exists
            parallelChecks.push(function (then) {
              $('fs').stat($('path').join(dir, 'dude-js', 'services'), then);
            });

            $('async').parallel(parallelChecks, callback);
          });
        },



        'Verifying list.json': function (callback) {

          var list = $('../list.json');

          if ( ! $('util').isArray(list) ) {
            return callback(new TypeError('List of available dependencies must be an array'));
          }

          try {
            list.forEach(function (dep, depi) {
              // Dependency must be an object
              if ( dep.constructor !== Object ) {
                throw new TypeError('Dependency #' + depi + ' must be an object');
              }

              // Dependency must have a name
              if ( typeof dep.name !== 'string' ) {
                throw new TypeError('Dependency #' + depi + ' is missing name');
              }

              // Dependency must have a slug
              if ( typeof dep.slug !== 'string' ) {
                throw new TypeError('Dependency #' + depi + ' is missing slug');
              }

              // Dependency must have an about
              if ( typeof dep.about !== 'string' ) {
                throw new TypeError('Dependency #' + depi + ' is missing about');
              }

              // Dependency must have a latest version
              if ( typeof dep.latest !== 'string' ) {
                throw new TypeError('Dependency #' + depi + ' is missing latest');
              }

              // Dependency must have a list of versions
              if ( ! $('util').isArray(dep.versions) ) {
                throw new TypeError('Dependency #' + depi + ' is missing versions');
              }

              // List of versions must not be empty
              if ( ! dep.versions.length ) {
                throw new Error('Dependency #' + depi + ' versions list is empty');
              }

              // Each version must be a string
              dep.versions.forEach(function (version, versioni) {
                if ( typeof version !== 'string' ) {
                  throw new TypeError('Dependency #' + depi + ' version #' + versioni + ' must be a string');
                }
              });

              // Dependency must have an installation how-to
              if ( typeof dep.install !== 'object' || dep.install.constructor !== Object ) {
                throw new TypeError('Dependency #' + depi + ' must be have an install how-to');
              }

              // There must be an installation how-to for latest version
              var installForLatest = Object.keys(dep.install).some(function (semver) {
                return $('semver').satisfies(dep.latest, semver);
              });

              if ( ! installForLatest ) {
                throw new Error('No installation how-to found for latest version in dependency #' + depi);
              }

              // There must be an installation how-to for each version in the list
              dep.versions.forEach(function (version) {
                var installForVersion = Object.keys(dep.install).some(function (semver) {
                  return $('semver').satisfies(version, semver);
                });

                if ( ! installForVersion ) {
                  throw new Error('No installation how-to found for version ' + version + ' in dependency #' + depi);
                }
              });

              // Checking each installation how-tos
              for ( var installVersion in dep.install ) {
                // Installation how-to must have a source
                if ( typeof dep.install[installVersion].source !== 'string' ) {
                  throw new TypeError('Missing source for installation how-to ' + installVersion + ' for dependency ' + dep.name);
                }

                // Installation how-to must have an extension
                if ( typeof dep.install[installVersion].extension !== 'string' ) {
                  throw new TypeError('Missing extension for installation how-to ' + installVersion + ' for dependency ' + dep.name);
                }
              }

              // Dependency must have a start how-to
              if ( typeof dep.start !== 'object' || dep.start.constructor !== Object ) {
                throw new TypeError('Dependency #' + depi + ' must have a start how-to');
              }

              // There must be an start how-to for latest version
              var startForLatest = Object.keys(dep.start).some(function (semver) {
                return $('semver').satisfies(dep.latest, semver);
              });

              if ( ! startForLatest ) {
                throw new Error('No start how-to found for latest version in dependency #' + depi);
              }

              // There must be a start how-to for each version in the list
              dep.versions.forEach(function (version) {
                var startForVersion = Object.keys(dep.start).some(function (semver) {
                  return $('semver').satisfies(version, semver);
                });

                if ( ! startForVersion ) {
                  throw new Error('No start how-to found for version ' + version + ' in dependency #' + depi);
                }
              });

              // Checking each start how-to
              for ( var startVersion in dep.start ) {
                // Start how-to must have  a script
                if ( typeof dep.start[startVersion].script !== 'string' ) {
                  throw new TypeError('Missing script for start how-to ' + startVersion + ' for dependency ' + dep.name);
                }

                // Start how-to must have an arguments style declaration
                if ( typeof dep.start[startVersion]['arguments-style'] !== 'object' ) {
                  throw new TypeError('Missing arguments style declaration for start how-to ' + startVersion + ' for dependency ' + dep.name);
                }

                // If arguments style is object, there must be an arguments transform declaration
                if ( dep.start[startVersion]['arguments-style'].constructor === Object ) {
                  if ( typeof dep.start[startVersion]['arguments-transform'] !== 'string'  ) {
                    throw new Error('For dependency ' + dependency.name + ', in start how-to semver ' + startVersion + ', since arguments style is an object, there should be an arguments transform declaration');
                  }

                  if ( ['object to long options'].indexOf(dep.start[startVersion]['arguments-transform']) < 0 ) {
                    throw new Error('Unknown arguments transform declaration for start candidate ' + startVersion + ' for dependency ' + dependency.name);
                  }
                }

                // There should be an arguments object
                if ( typeof dep.start[startVersion].arguments !== 'object' || dep.start[startVersion].arguments.constructor !== Object ) {
                  throw new Error('Missing arguments declaration (even empty) for start candidate ' + startVersion + ' of dependency ' + dependency.name);
                }

                // If arguments not empty, checking them
                if ( Object.keys(dep.start[startVersion].arguments).length ) {
                  for ( var arg in dep.start[startVersion].arguments ) {
                    if ( typeof dep.start[startVersion].arguments[arg].about !== 'string' ) {
                      throw new Error('Missing about for argument ' + arg + ' in start how-to for versions ' + startVersion + ' for dependency ' + dependency.name);
                    }

                    if ( typeof dep.start[startVersion].arguments[arg].required !== 'boolean' ) {
                      throw new Error('Missing required for argument ' + arg + ' in start how-to for versions ' + startVersion + ' for dependency ' + dependency.name);
                    }
                  }
                }
              }
            });
          }
          catch ( error ) {
            return callback(error);
          }

          callback();
        }
      }
    }, domain.intercept(function () {
      $('fs').rmdir(dir, domain.intercept(function () {}));
    }));

  }));
});