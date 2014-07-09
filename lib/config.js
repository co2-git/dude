var $ = require;

function getJSON (callback) {
  $('fs').readFile($('path').join(process.cwd(), 'dude.json'),
    { encoding: 'utf-8' },
    function (error, data) {
      if ( error ) {
        if ( error.code === 'ENOENT' ) {
          return $('fs').writeFile($('path').join(process.cwd(), 'dude.json'),
            '{}', { encoding: 'utf-8' },
            function (error) {
              if ( error ) {
                return callback(error);
              }
              return callback(null, {});
            });
        }
        else {
          return callback(error);
        }
      }
      
      callback(null, JSON.parse(data));
    });
}

function setJSON (data, callback) {
  $('fs').writeFile($('path').join(process.cwd(), 'dude.json'),
    JSON.stringify(data, null, 2),
    { encoding: 'utf-8' },
    function (error) {
      if ( error ) {
        return callback(error);
      }
      callback(null, data);
    });
}

exports.set = function (key) {
  for ( var callback, i = 0; i < arguments.length; i ++ ) {
    callback = arguments[i.toString()];
  }

  if ( typeof callback !== 'function' ) {
    throw new Error('Missing callback');
  }

  switch ( key ) {
    case 'build':
        var techno = arguments[1];
        
        switch ( techno ) {
          case 'sass':
          case 'browserify':
          case 'uglify':
            var source = [];
            var dest;

            for ( i = 2; i < arguments.length; i ++ ) {
              if ( arguments[i] === '--source' ) {
                source = arguments[(i + 1)].split(',');
              }

              if ( arguments[i] === '--dest' ) {
                dest = arguments[(i + 1)];
              }
            }

            getJSON(function (error, data) {
              if ( error ) {
                return callback(error);
              }
              
              if ( ! data.build ) {
                data.build = {};
              }
              
              if ( ! data.build[techno] ) {
                data.build[techno] = [];
              }

              data.build[techno].push({
                source: source,
                dest: dest
              });
              
              setJSON(data, callback);
              
            });
            break;
        }
      break;
  }
};