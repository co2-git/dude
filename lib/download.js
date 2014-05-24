var $ = require;

module.exports = function (url, dest, callback) {
  var domain = $('domain').create();

  domain.on('error', function (error) {
    callback(error);
  });

  domain.run(function () {
    function convert (num) {
      if ( num >= 1024 ) {
        if ( num >= (1024*1024) ) {
          if ( num >= (1024*1024*1024) ) {
            divider = (1024*1024*1024);
            unit = 'GB';
          } else {
            divider = (1024*1024);
            unit = 'MB';
          }
        } else {
          divider = 1024;
          unit = 'KB';
        }
      } else {
        divider = 1;
        unit = 'B';
      }
      return Math.floor(num / divider) + ' ' + unit;
    };

    console.log(('  Downloading from ' + url.bold + ' to ' + dest.bold).grey);

    var parsed = $('url').parse(url);

    switch ( parsed.protocol.replace(/:$/, '') ) {
      case 'http':
      case 'https':
        $('request-progress')(
          $('request')(url))
            
            .on('progress', function (state) {
              var divider, unit, total = convert(state.total);
              process.stdout.write("Downloaded " + convert(state.received) + '/' +
                total + ' - ' + state.percent + " %                    \r");
            })
            
            .on('error', domain.intercept(function () {}))
            
            .on('close', function (code) {
              console.log('1st close');
                console.log(arguments);
            })
            
            .pipe($('fs').createWriteStream(dest))
              
              .on('error', domain.intercept(function () {}))
              
              .on('close', function (code) {
                callback();
              });
        break;
    }
  });
};