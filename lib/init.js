var $ = require;

module.exports = function (callback) {
  var domain = $('domain').create();

  domain.on('error', function (error) {
    callback(error);
  });

  domain.run(function () {
    function mkdir (then) {
      $('fs').mkdir($('path').join(process.env.PWD, 'dude-js'), function (error) {
        if ( error ) {
          if ( error.code !== 'EEXIST' ) {
            throw error;
          }
        }
        then();
      });
    }

    function mkdirDependencies (then) {
      $('fs').mkdir($('path').join(process.env.PWD, 'dude-js', 'dependencies'), function (error) {
        if ( error ) {
          if ( error.code !== 'EEXIST' ) {
            throw error;
          }
        }
        then();
      }); 
    }

    function mkdirTmp (then) {
      $('fs').mkdir($('path').join(process.env.PWD, 'dude-js', 'tmp'), function (error) {
        if ( error ) {
          if ( error.code !== 'EEXIST' ) {
            throw error;
          }
        }
        then();
      }); 
    }

    function mkdirLog (then) {
      $('fs').mkdir($('path').join(process.env.PWD, 'dude-js', 'log'), function (error) {
        if ( error ) {
          if ( error.code !== 'EEXIST' ) {
            throw error;
          }
        }
        then();
      }); 
    }

    function mkdirServices (then) {
      $('fs').mkdir($('path').join(process.env.PWD, 'dude-js', 'services'), function (error) {
        if ( error ) {
          if ( error.code !== 'EEXIST' ) {
            throw error;
          }
        }
        then();
      }); 
    }

    mkdir(domain.intercept(function () {
      $('async').parallel([mkdirDependencies, mkdirTmp, mkdirLog, mkdirServices],
        domain.intercept(function () {
          callback();
        }));
    }));   
  });
};