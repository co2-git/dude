var $ = require;

var unique = process.pid.toString() + (+new Date()).toString() + (Math.ceil(Math.random()*7919)).toString();

module.exports = function (service, options, callback) {
  var domain = $('domain').create();

  domain.on('error', function (error) {
    // remove service.json from the running services directory
    $('fs').unlink($('path').join(process.cwd(), 'dude-js', 'services', unique + '.json'),
      function () {

      });

    callback(error, unique);
  });

  domain.run(function () {
    // Make sure we have the service name
    if ( typeof service !== 'string' ) {
      throw new Error('Missing service name');
    }

    // if service is a script, redirect to start-script
    if ( /\.js$/.test(service) ) {
      $('./start-script')(service,  options, callback);
    }
    else {
      $('./start-service')(service,  options, callback);
    }
  });
};