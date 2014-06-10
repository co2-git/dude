var $ = require;

module.exports = function (dependency, script, args, callback) {
  var domain = $('domain').create();

  domain.on('error', function (error) {
    callback(error);
  });

  domain.run(function () {
    var installed = $($('path').join(process.cwd(), 'dude.json'));
    var available = $('../list.json');

    function viewBinFiles (dependency, version, then) {
      // get dependency info from available
      available.forEach(function (av) {
        if ( av.slug === dependency ) {

          found = av;

          // Looking for an install candidate
          var install;

          for ( var semver in av.install ) {
            if ( $('semver').satisfies(version, semver) ) {
              install = av.install[semver];
            }
          }

          if ( ! install ) {
            throw new Error('No install candidate found for dependency %s version %s'.grey, dependency, version);
          }

          if ( 'filename' in av.install[semver] ) {
            folderName = $('./parse')(av.install[semver].filename, { version: version });
          }
          else {
            folderName = $('path').basename($('./parse')(av.install[semver].source, { version: version })).replace(new RegExp('.' + av.install[semver].extension + "$"), '');
          }
        }
      });

      if ( ! found ) {
        throw new Error('Not found in available: ' + dependency + ' v' + version);
      }

      // if no folder name, guess it
      if ( ! folderName ) {
        throw new Error('No folder name can be found for dependency: ' + dependency);
      }

      console.log(('    Will now scan dir ' + (folderName + '/bin').bold).grey);

      if ( typeof then === 'function' ) {
        $('fs').readdir($('path').join(process.cwd(), 'dude-js', 'dependencies', dependency, folderName, 'bin'),
          then);
      }
      else {
        return $('path').join(process.cwd(), 'dude-js', 'dependencies', dependency, folderName, 'bin');
      }
    }

    if ( typeof dependency === 'undefined' ) {
      console.log('    No dependency specified, exposing all'.grey);
      
      if ( typeof script === 'undefined' ) {
        var bin = {};

        for ( var dep in installed.dependencies ) {
          bin[dep] = function (cb) {
            viewBinFiles(this.dependency, this.version, cb);

          }.bind({ dependency: dep, version: installed.dependencies[dep] });
        }

        $('async').parallel(bin, domain.intercept(function (results) {
          callback(null, results);
        }));
      }
    }

    else if ( typeof dependency === 'string' ) {
      var _dep;

      if ( typeof script === 'undefined' ) {
        for ( _dep in installed.dependencies ) {
          if ( _dep === dependency ) {
            viewBinFiles(dependency, installed.dependencies[_dep], callback);
          }
        }
      }
      
      else {
        var path, found;
        
        for ( _dep in installed.dependencies ) {
          if ( _dep === dependency ) {
            found = true;
            path = $('path').join(viewBinFiles(dependency, installed.dependencies[_dep]), script);
          }
        }

        if ( ! found ) {
          throw new Error('Dependency not found');
        }

        var spawn = $('child_process').spawn(path, args, {
          env: process.env
        });

        spawn.on('error', callback);

        spawn.on('exit', function (signal) {
          if ( typeof signal === 'number' && ! signal ) {
            return callback();
          }
          return callback(new Error('Got status ' + signal));
        });

        spawn.stdout.pipe(process.stdout);
        spawn.stderr.pipe(process.stderr);
      }
    }
  });
};