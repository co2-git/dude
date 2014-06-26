var $ = require;

module.exports = function (techno, options, callback) {
  var domain = $('domain').create();

  domain.on('error', function (error) {
    callback(error);
  });

  domain.run(function () {

    if ( options.print ) {
      return callback(null, $('../package.json').config.build);
    }

    if ( ! techno ) {
      var json = $($('path').join(process.cwd(), 'dude.json'));

      if ( ! json.build ) {
        throw new Error('Nothing to build on');
      }

      var parallels = [];

      for ( techno in json.build ) {
        parallels.push(function (cb) {
          $('./build/' + this.techno)(options, callback);
        }.bind({ techno: techno }));
      }

      $('async').parallel(parallels, callback);
    }
    
    else {
      $('./build/' + techno)(options, callback);
    }
  });
};