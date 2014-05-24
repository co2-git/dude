var $ = require;

module.exports = function (version, callback) {
  var domain = $('domain').create();

  domain.on('error', function (error) {
    callback(error);
  });

  domain.run(function () {
    console.log('  Installing MongoDB'.grey, ('version ' + version).grey);

    function hasDudeFolder (then) {
      $('fs').stat($('path').join(process.env.PWD, 'dude-js'), function (error, stat) {
        if ( error ) {
          if ( error.code !== 'ENOENT' ) {
            throw error;
          }

          console.log('  dude-js folder not found, creating it now'.grey);

          $('fs').mkdir($('path').join(process.env.PWD, 'dude-js'), then);
        }
        else {
          then();
        }
      });
    }

    function hasTmpFolder (then) {
      $('fs').stat($('path').join(process.env.PWD, 'dude-js', 'tmp'), function (error, stat) {
        if ( error ) {
          if ( error.code !== 'ENOENT' ) {
            throw error;
          }

          console.log('  dude-js tmp folder not found, creating it now'.grey);

          $('fs').mkdir($('path').join(process.env.PWD, 'dude-js', 'tmp'), then);
        }
        else {
          then();
        }
      });
    }

    function hasDependencyFolder (then) {
      $('fs').stat($('path').join(process.env.PWD, 'dude-js', 'mongodb'), function (error, stat) {
        if ( error ) {
          if ( error.code !== 'ENOENT' ) {
            throw error;
          }

          console.log('  dude-js mongodb folder not found, creating it now'.grey);

          $('fs').mkdir($('path').join(process.env.PWD, 'dude-js', 'mongodb'), then);
        }
        else {
          then();
        }
      });
    }

    function updateJSON (then) {
      $('fs').readFile($('path').join(process.env.PWD, 'dude.json'),
        { encoding: 'utf-8' },
        function (error, data) {
          if ( error ) {
            if ( error.code !== 'ENOENT' ) {
              throw error;
            }
            
            console.log(('  dude.json not found, creating it now').grey);
            
            $('fs').writeFile($('path').join(process.env.PWD, 'dude.json'),
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

            json.dependencies.mongodb = version;

            $('fs').writeFile($('path').join(process.env.PWD, 'dude.json'),
              JSON.stringify(json, null, 2),
              { encoding: 'utf-8' },
              domain.intercept(function () {
                then();
              }));
          }
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

      var file = 'mongodb-' + osType + '-' + osArch + '-' + version;

      var url = 'http://fastdl.mongodb.org/linux/' + file + '.tgz';

      var dest = $('path').join(process.env.PWD, 'dude-js', 'tmp', file + '.tgz');

      $('../download')(url, dest, domain.intercept(function () {
        $('../extract')(dest, $('path').join(process.env.PWD, 'dude-js', 'mongodb'),
          domain.intercept(function () {
            updateJSON(domain.intercept(function () {
              callback(null, version, file);
            }));
          }));
      }));
    }

    hasDudeFolder(domain.intercept(function () {
      hasTmpFolder(domain.intercept(function () {
        hasDependencyFolder(domain.intercept(function () {
          install();
        }));
      }));
    }));

    return;
  });
};