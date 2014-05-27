var $ = require;

module.exports = function (dependency, version, callback) {
  var domain = $('domain').create();

  domain.on('error', function (error) {
    callback(error);
  });

  domain.run(function () {
    if ( typeof dependency !== 'string' ) {
      throw new Error('Missing dependency name');
    }

    if ( typeof version !== 'string' ) {
      throw new Error('Missing dependency version');
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

    function install () {
      var osType, osArch;

      switch ( $('os').type() ) {
        case 'Linux':
          osType = 'linux';
          break;

        default:
          throw new Error('We are sorry. As a beta version, we only support Linux for the moment :(');
      }

      switch ( $('os').arch() ) {
        case 'x64':
          osArch = 'x86_64';
          break;

        default:
          throw new Error('We are sorry. As a beta version, we only support 64 bits architecture for the moment :(');
      }

      var url = Dependency.install[version].source
        .replace(/\{\{os\.type\}\}/g, osType)
        .replace(/\{\{os\.arch\}\}/g, osArch)
        .replace(/\{\{dependency\.version\}\}/g, version);

      var dest = $('path').join(process.cwd(), 'dude-js', 'tmp', $('path').basename(url));

      $('./download')(url, dest, domain.intercept(function () {
        $('./extract')(dest, $('path').join(process.cwd(), 'dude-js', 'dependencies', dependency),
          domain.intercept(function () {
            updateJSON(domain.intercept(function () {
              callback(null, version);
            }));
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