var $ = require;

module.exports = function (dependency, version, callback) {
  var domain = $('domain').create();

  domain.on('error', function (error) {
    callback(error);
  });

  domain.run(function () {
    if ( typeof dependency !== 'string' ) {
      // auto install

      var installed = $($('path').join(process.cwd(), 'dude.json'));

      var parallels = [];

      if ( ! installed.dependencies ) {
        throw new Error('No dependencies declarations found in dude.json');
      }

      for ( var dep in installed.dependencies ) {
        parallels.push(function (cb) {
          $('./install')(this.dep, this.version, cb);
        }.bind({ dep: dep, version: installed.dependencies[dep] }));
      }

      return $('async').parallel(parallels, callback);
    }

    if ( typeof version !== 'string' ) {
      version = 'latest';
    }

    var list = $('../list.json');

    var Dependency;

    list.forEach(function (dep) {
      if ( dep.slug === dependency ) {
        Dependency = dep;
      }
    });

    if ( ! Dependency ) {
      throw new Error('No such dependency: ' + dependency);
    }

    if ( version === 'latest' ) {
      version = Dependency.latest;
    }

    function checkIfAlreadyInstalled (then) {
      $('fs').readFile($('path').join(process.cwd(), 'dude.json'),
        { encoding: 'utf-8' },
        function (error, data) {
          if ( error ) {
            if ( error.code !== 'ENOENT' ) {
              throw error;
            }
            
            then(null, false);
          }
          else {
            var json;

            try {
              json = JSON.parse(data);
            }
            catch ( error ) {
              throw new Error('Can not read JSON file');
            }

            return then(null, json.dependencies && json.dependencies[dependency] && json.dependencies[dependency] === version);
          }
        });
    }

    function updateJSON (then) {
      $('fs').readFile($('path').join(process.cwd(), 'dude.json'),
        { encoding: 'utf-8' },
        function (error, data) {
          if ( error ) {
            if ( error.code !== 'ENOENT' ) {
              throw error;
            }
            
            console.log(('  dude.json not found, creating it now').grey);
            
            $('fs').writeFile($('path').join(process.cwd(), 'dude.json'),
              '{}',
              { encoding: 'utf-8' },
              domain.intercept(function () {
                updateJSON(then);
              }));
          }
          else {
            var json;

            try {
              json = JSON.parse(data);
            }
            catch ( error ) {
              throw new Error('Can not read JSON file');
            }

            if ( ! json.dependencies ) {
              json.dependencies = {};
            }

            json.dependencies[dependency] = version;

            $('fs').writeFile($('path').join(process.cwd(), 'dude.json'),
              JSON.stringify(json, null, 2),
              { encoding: 'utf-8' },
              domain.intercept(function () {
                then();
              }));
          }
        });
    }

    function mkdirDependency (then) {
      $('fs').mkdir($('path').join(process.cwd(), 'dude-js', 'dependencies', dependency),
        function (error) {
          if ( error && error.code !== 'EEXISTS' ) {
            throw error;
          }
          then();
        });
    }

    function processInstall (steps, then) {
      $('async').series(steps.map(function (step) {
        return function (cb) {

          console.log('    %s %s'.grey, step.command,  (step.args || []).join(' '));

          var spawn = $('child_process').spawn(step.command, step.args || [], {
            cwd: $('path').join(process.cwd(), 'dude-js', 'dependencies', dependency, getFolderName())
          });

          spawn.on('error', domain.intercept(function () {}));

          spawn.on('exit', function (signal) {
            if ( typeof signal === 'number' && ! signal ) {
              cb();
            }
            else {
              cb(new Error('Command ' + step.command + ' failed with signal ' + signal));
            }
          });

        };
      }), domain.intercept(function () {
        then();
      }));
    }

    function getInstallationCandidate () {
      for ( var semver in Dependency.install ) {
        if ( $('semver').satisfies(version, semver) ) {
          return Dependency.install[semver];
        }
      }

      throw new Error('No installation candidate found for version ' + version);
    }

    function getFolderName () {
      var installCandidate = getInstallationCandidate();

      return $('./parse')(installCandidate.filename ? installCandidate.filename :
        $('path').basename(installCandidate.source).replace(new RegExp('.' + installCandidate.extension + "$"), ''), { version: version });
    }

    function install () {
      var osType, osArch;

      switch ( $('os').type() ) {
        case 'Linux':
          osType = 'linux';
          break;

        case 'SunOS':
          osType = 'sunos';
          break;

        default:
          throw new Error('We are sorry. As a beta version, we only support Linux for the moment :(');
      }

      switch ( $('os').arch() ) {
        case 'x64':
          osArch = 'x86_64';
          break;

        default:
          throw new Error('We are sorry. As a beta version, we only support 64 bits architecture for the moment. Value given: ' + $('os').arch());
      }

      var installCandidate = getInstallationCandidate();

      var url = installCandidate.source
        .replace(/\{\{os\.type\}\}/g, osType)
        .replace(/\{\{os\.arch\}\}/g, osArch)
        .replace(/\{\{dependency\.version\}\}/g, version);

      var dest = $('path').join(process.cwd(), 'dude-js', 'tmp', $('path').basename(url));

      $('./download')(url, dest, domain.intercept(function () {
        $('./extract')(dest, $('path').join(process.cwd(), 'dude-js', 'dependencies', dependency),
          domain.intercept(function () {

            if ( installCandidate.process ) {
              processInstall(Dependency.install[version].process, domain.intercept(function () {
                updateJSON(domain.intercept(function () {
                  callback(null, version);
                }));
              }));
            }
            else {
              updateJSON(domain.intercept(function () {
                callback(null, version);
              }));
            }

          }));
      }));
    }

    checkIfAlreadyInstalled(domain.intercept(function (installed) {
      if ( installed ) {
        throw new Error('Already installed: ' + dependency + '@' + version);
      }

      console.log(('  Installing ' + Dependency.name.bold + ' version ' + version.bold).grey);

      $('./init')(domain.intercept(function () {
        mkdirDependency(domain.intercept(function () {
          install();
        }));
      }));
    }));
  });
};