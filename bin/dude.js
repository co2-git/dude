#!/usr/bin/env node

var $ = require;

var domain = $('domain').create();

domain.on('error', function (error) {
  console.log('error'.red, error.stack.yellow);
});

domain.run(function () {
  $('colors');

  var package = $('../package.json');

  var command = {
    actions: {
      "init": {
        about: 'install necessary folder for dude-js in current directory',
        action: function () {
          $('../lib/init')(domain.intercept(function () {
            console.log('dude.js init ok'.green);
          }));
        }
      },


      "available": {
        about: 'List all available dude dependencies',
        action: function () {
          var list = $('../list.json');

          console.log();
          console.log(('  dude.js | ' + list.length + ' available dependencies for download').bold.blue);
          console.log();

          list.forEach(function (dependency) {
            console.log('  ' + dependency.name + ' ' + dependency.slug.cyan + '', '      ', dependency.about);
          });

          console.log();
        }
      },


      "installed":  {
        about: 'List installed dude dependencies',
        action: function () {
          var list;

          try {
            list = $($('path').join(process.env.PWD, 'dude.json'));
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
        }
      },


      "install": {
        about: 'Install a new dependency',
        action: function (dependency) {
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

          var version = Dependency.latest;

          $('../lib/install')(dependency, version, domain.intercept(function (version, dir) {
            console.log(('  Successfully installed ' + dependency.bold + ' version ' + version.bold).green);
          }));
        }
      },


      "start": {
        about: 'start a service or a script',
        action: function (service) {
          var options = {};

          if ( /\.js$/.test(service) ) {

          }
          
          else {
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

            options = Service.start['arguments-style'] || [];

            for ( var i = 4, bits; i < process.argv.length; i ++ ) {
              if ( $('util').isArray(options) ) {
                options.push(process.argv[i]);
              }
              else {
                bits = process.argv[i].split('=');
                options[bits[0]] = bits[1];
              }
            }
          }

          $('../lib/start')(service, options || '{}', domain.intercept(function (status) {
            console.log('started'.green, status);
          }));
        }
      },


      "running": {
        about: 'Show running services and scripts',
        action: function () {
          $('../lib/running')(domain.intercept(function (running) {
            if ( ! running.length ) {
              return console.log('    Nothing running'.yellow);
            }
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
        }
      },


      "stop": {
        about: 'Stop a service or a script',
        action: function (service) {
          if ( ! service ) {
            service = true;
          }
          $('../lib/stop')(service, domain.intercept(function (stopped) {
            if ( service === true && ! stopped.length ) {
              return console.log('Nothing is running so nothing was stooped'.yellow);
            }
            stopped.forEach(function (s) {
              console.log(((s.service || s.script) + ' has been stopped').green, ('pid ' + s.pid + ' ID ' + s.log).grey);
            });
          }));
        }
      },


      "reload": {
        about: 'Reload a script',
        action: function (script) {
          $('../lib/reload')(script, domain.intercept(function (message) {
            console.log((script + ' has been reloaded').green);
          }));
        }
      },

      "bin": {
        about: 'Shortcut access to the bin folder of a dependency',
        action: function (dependency, script) {
          $('../lib/bin')(dependency, script, domain.intercept(function (bin) {
            console.log(bin);
          }));
        }
      }


    }
  };

  if ( ! process.argv[2] || ['-h', '--help', 'help'].indexOf(process.argv[2]) > -1 ) {
    console.log();
    console.log('    ' + [package.name, 'v' + package.version, '|', package.description].join(' ').green);

    console.log();
    console.log('    Usage:');
    console.log();
    console.log('        dudejs <action> [<arguments>...]'.magenta);
    console.log();


    console.log();
    console.log('    Actions:');
    console.log();

    for ( var action in command.actions ) {
      for ( var space1 = '', i = action.length; i < 15 ; i ++, space1 += ' ' );

      console.log('    ' + action.bold.cyan + space1 + command.actions[action].about);
    }

    console.log();
    console.log('    Full documentation at https://github.com/co2-git/dude'.grey);
    console.log();

    return;
  }

  if ( command.actions[process.argv[2]] ) {
    command.actions[process.argv[2]].action.apply(null, process.argv.reduce(function (args, arg, argi) {
      if ( argi > 2 ) {
        args.push(arg);
      }
      return args;
    }, []));
  }
});