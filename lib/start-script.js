var $ = require;

var unique = process.pid.toString() + (+new Date()).toString() + (Math.ceil(Math.random()*7919)).toString();

module.exports = function (script, options, callback) {

  if ( typeof callback === 'undefined' && typeof options === 'function' ) {
    callback = options;
  }

  if ( options.constructor !== Object ) {
    options = {};
  }

  var domain = $('domain').create();

  domain.on('error', function (error) {
    // remove service.json from the running services directory
    $('fs').unlink($('path').join(process.cwd(), 'dude-js', 'services', unique + '.json'),
      function () {

      });

    callback(error, unique);
  });

  domain.run(function () {
    var unref = setTimeout(function () {
      // Make sure we have the service name
      if ( typeof script !== 'string' ) {
        throw new Error('Missing script name');
      }

      // make sure script is a JS script
      if ( ! /\.js$/.test(script) ) {
        throw new Error('Script must end by .js');
      }
      
      // stream to ouput message
      var stream = $('fs').createWriteStream($('path').join(process.cwd(), 'dude-js', 'log', unique),
        { encoding: 'utf-8' });

      // spawning the fork in the background
      var spawn = $('child_process')
        .spawn($('path').join($('path').dirname(__dirname), 'bin', 'cluster.js'),
          [script, unique, JSON.stringify(options)],
          {
            cwd: process.cwd(),
            env: process.env,
            detached: true,
            stdio: 'ignore'
          });

      spawn.unref();

      spawn.on('error', function (error) {
        stream.write($('util').inspect(error));
        throw error;
      });

      spawn.on('exit', function (signal) {
        if ( typeof signal === 'number' && ! signal ) {
          callback();
        }
        throw new Error('Got service error! Script ' + script + ' got signal/code ' + signal);
      });

      // Info about the service started
      var identity = {
        service: script,
        version: '/',
        arguments: options,
        log: unique,
        pid: spawn.pid,
        started: +new Date()
      };

      // Write info to the log as the header
      // stream.write("-- dude.js log (started " + new Date() + ") --\r\n\r\n\r\n" +
      //   JSON.stringify(identity, null, 2) + "\r\n\r\n\r\n-- service begins now --\r\n\r\n\r\n");

      // Create the service.json file to tell dude.js this service is running
      $('fs').writeFile($('path').join(process.cwd(), 'dude-js', 'services', unique + '.json'),
        JSON.stringify(identity, null, 2),
        { encoding: 'utf-8' },
        domain.intercept(function () {
          callback(null, { pid: spawn.pid, id: unique });
        }));
    });

    unref.unref();
  });
};