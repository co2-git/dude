var $ = require;

function getJSON (callback) {
  $('fs').readFile($('path').join(process.cwd(), 'dude.json'),
    { encoding: 'utf-8' },
    function (error, data) {
      if ( error ) {
        return callback(error);
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
            switch ( arguments[2] ) {
              case 'files':
                if ( typeof arguments[3] === 'string' && typeof arguments[4] === 'string' ) {
                  getJSON(function (error, data) {
                    if ( error ) {
                      return callback(error);
                    }
                    if ( ! data.build ) {
                      data.build = {};
                    }
                    if ( ! data.build[techno] ) {
                      data.build[techno] = {};
                    }
                    data.build[techno][this.source] = this.dest;
                    setJSON(data, callback);
                  }.bind({ source: arguments[3], dest: arguments[4]}));
                }
                break;
            }
            break;
        }
      break;
  }
};