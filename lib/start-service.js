var $ = require;

var unique = process.pid.toString() + (+new Date()).toString() + (Math.ceil(Math.random()*7919)).toString();

module.exports = function (service, options, callback) {
  var domain = $('domain').create();

  domain.on('error', function (error) {
    callback(error, unique);

    $('fs').unlink($('path').join(process.env.PWD, 'dude-js', 'services', unique + '.json'),
      function () {

      });
  });

  domain.run(function () {
    if ( typeof service !== 'string' ) {
      throw new Error('Missing service name');
    }

    var list = $('../list.json');

    var Service;

    list.forEach(function (dep) {
      if ( dep.slug === service ) {
        Service = dep;
      }
    });

    if ( ! Service ) {
      throw new Error('No such service: ' + service);
    }

    var args = [];

    if ( $('util').isArray (options) ) {
      args = options;
    }

    else {
      for ( var arg in Service.arguments ) {
        /* Check forr required arguments -- exit if is required and is missing */
        if ( Service.arguments[arg].required && ! options[arg] ) {
          throw new Error('Missing required argument: ' + arg);
        }

        /* Populate arguments to be passed to start script */
        if ( options[arg] ) {
          switch ( Service['arguments-transform'] ) {
            case 'object to long options':
              args.push('--' + arg, options[arg]);
              break;
          }
        }
      }
    }

    var json;

    try {
      json = $($('path').join(process.env.PWD, 'dude.json'));
    }
    catch ( error ) {
      throw new Error('No JSON file found. This means the service ' + service + ' is not installed -- hence it can not be started.');
    }

    if ( ! json.dependencies || ! json.dependencies[service] ) {
      throw new Error(service + ' is not installed and therefore can not been started.');
    }

    var version = json.dependencies[service];

    var base = $('path').join(process.env.PWD, 'dude-js', 'dependencies', service,
      $('path').basename(Service.install[version].source)
        .replace(/\{\{os\.type\}\}/g, $('./get-system-info').type)
        .replace(/\{\{os\.arch\}\}/g, $('./get-system-info').arch)
        .replace(/\{\{dependency\.version\}\}/g, version));

    if ( Service.install[version].extension ) {
      base = base.replace(new RegExp('\.' + Service.install[version].extension + "$"), '');
    }

    var startScript = $('path').join(base, Service.start.script);

    var stream = $('fs').createWriteStream($('path').join(process.env.PWD, 'dude-js', 'log', unique),
      { encoding: 'utf-8' });

    var spawn = $('child_process').spawn(startScript, args, {
      env: process.env,
      detached: true
    });

    spawn.unref();

    spawn.on('error', domain.intercept(function () {}));

    spawn.on('exit', function (signal) {
      if ( typeof signal === 'number' && ! signal ) {
        callback();
      }
      throw new Error('Could not start service ' + service + ', got signal/code ' + signal);
    });

    var identity = {
      service: service,
      version: version,
      arguments: options,
      log: unique,
      pid: spawn.pid,
      started: +new Date()
    };

    stream.write("-- dude.js log (started " + new Date() + ") --\r\n\r\n\r\n" +
      JSON.stringify(identity, null, 2) + "\r\n\r\n\r\n-- service begins now --\r\n\r\n\r\n");

    spawn.stdout.pipe(stream);

    spawn.stdin.pipe(stream);

    $('fs').writeFile($('path').join(process.env.PWD, 'dude-js', 'services', unique + '.json'),
      JSON.stringify(identity, null, 2),
      { encoding: 'utf-8' },
      domain.intercept(function () {
        callback(null, { pid: spawn.pid, id: unique });
      }));
  });
};