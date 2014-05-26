#!/usr/bin/node

var $ = require;

var domain = $('domain').create();

domain.on('error', function (error) {
  console.log('error'.red, error.stack.yellow);
});

domain.run(function () {
  $('colors');

  var program = $('commander');

  var package = $('../package.json');

  program
    .version(package.version);

  

  program
    .command('init')
    .description('install necessary folder for dude-js in current directory')
    .action(function () {
      $('../lib/init')(domain.intercept(function () {
        console.log('dude.js init ok'.green);
      }));
    });



  program
    .command('available')
    .description('List all available dude dependencies')
    .action(function () {
      var list = $('../list.json');

      console.log();
      console.log(('  dude.js | ' + list.length + ' available dependencies for download').bold.blue);
      console.log();

      list.forEach(function (dependency) {
        console.log('  ' + dependency.name + ' ' + dependency.slug.cyan + '', '      ', dependency.about);
      });

      console.log();
    });



  program
    .command('installed')
    .description('List installed dude dependencies')
    .action(function () {
      try {
        var list = $($('path').join(process.env.PWD, 'dude.json'));
      }
      catch ( error ) {
        return console.log('  Nothing installed yet!'.yellow);
      }

      if ( ! list.dependencies ) {
        return console.log('  Nothing installed yet!'.yellow);
      }

      var depLength = Object.keys(list.dependencies).length;

      console.log();
      console.log(('  dude.js | ' + depLength + ' dependenc' +
        ( depLength > 1 ? 'ies' : 'y' ) + ' installed').bold.blue);
      console.log();

      for ( var dep in list.dependencies ) {
        console.log('  ' + dep + ' version ' + list.dependencies[dep]);
      }

      console.log();
    });


  program
    .command('install <dependency>')
    .description('Install a new dependency')
    .action(function (dependency, version) {
      var list = $('../list.json');

      var Dependency;

      list.forEach(function (dep) {
        if ( dep.slug === dependency ) {
          Dependency = dep;
        }
      });

      if ( ! Dependency ) {
        return console.log('No such dependency'.red, ('Dependency not found: ' + dependency).yellow);
      }

      if ( ! version ) {
        version = Dependency.latest;
      }

      $('../lib/install')(dependency, version, domain.intercept(function (version, dir) {
        console.log(('  Successfully installed ' + dependency.bold + ' version ' + version.bold).green);
      }));
    });

  
  program
    .command('start <service> [options...]')
    .description('Start a service or a script. Options can be passed like this option=value, or just value')
    .action(function (service) {

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

      var options = Service.start['arguments-style'] || [];

      for ( var i = 4, bits; i < process.argv.length; i ++ ) {
        if ( $('util').isArray(options) ) {
          options.push(process.argv[i]);
        }
        else {
          bits = process.argv[i].split('=');
          options[bits[0]] = bits[1];
        }
      }

      $('../lib/start-service')(service, options || '{}', domain.intercept(function (status) {
        console.log('started', status);
      }));
    });


  program
    .command('running [options]')
    .description('Show running services and scripts')
    .action(function () {
      $('../lib/running')(domain.intercept(function (running) {
        running.forEach(function (item) {
          console.log(item.service.green.bold + '@'.grey + item.version.cyan,
            'pid:'.grey, item.pid.toString().cyan,
            'arguments:'.grey, JSON.stringify(item.arguments).cyan);

          console.log('    ' + 'log:'.grey, item.log.magenta,
            'started:'.grey, $('moment')(item.started).fromNow().magenta);

          if ( item.zombie ) {
            console.log('    ' + 'ZOMBIE ALERT'.red.bold, 'It seems this service died unexpectedly'.yellow);
          }
        });
      }));
    });



  program
    .command('stop <service>')
    .description('Stop a service or a script')
    .action(function (service) {
      $('../lib/stop')(service, domain.intercept(function (message) {
        console.log((service + ' has been stopped').green);
      }));
    });



  program.parse(process.argv);
});