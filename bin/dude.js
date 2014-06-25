#!/usr/bin/env node

var $ = require;

var domain = $('domain').create();

domain.on('error', function (error) {
  console.log('error'.red, error.stack.yellow);
});

domain.run(function () {
  var program = $('../lib/program');

  program

    .dirname($('path').dirname(__dirname))
    
    .action('init')
      .about('install necessary folder for dude-js in current directory')
      .run(function () {
        $('../lib/init')(domain.intercept(function () {
          console.log('dude.js init ok'.green);
        }));
      })

    .action('available')
      .about('List all available dude dependencies')
      .run(function () {
        var list = $('../list.json');

        console.log();
        console.log(('  dude.js | ' + list.length + ' available dependencies for download').bold.blue);
        console.log();

        list.forEach(function (dependency) {
          console.log('  ' + dependency.name + ' ' + dependency.slug.cyan + '', '      ', dependency.about);
        });

        console.log();
      })

    .action('installed')
      .about('List installed dude dependencies')
      .run(function () {
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
      })

    .action('install')
      .about('Install a new dependency')
      .run(function (dependency) {
        $('../lib/install')(dependency, null, domain.intercept(function (version, dir) {
          console.log(('  Successfully installed ' + dependency.bold + ' version ' + version.bold).green);
        }));
      })

    .action('start')
      .about('start a service or a script')
      .usage('Start a service', [
        {
          name: 'service',
          type: 'value',
          required: true
        }
      ])
      .usage('Start a script', [
        {
          name: 'script',
          type: 'value',
          required: true
        },

        {
          name: 'forks',
          type: 'option',
          required: false
        }
      ])
      .run(function (service) {
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
      })

    .action('running')
      .about('Show running services and scripts')
      .run(function () {
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
      })

    .action('stop')
      .about('Stop a service or a script')
      .usage('Stop a service by its log id', [
        {
          name: 'logID',
          type: 'value',
          required: true
        }
      ])
      .usage('Stop a service by its service/script name', [
        {
          name: 'name',
          type: 'value',
          required: true
        }
      ])
      .usage('Stop all running services/script', [])
      .usage('Specify a signal other than SIGTERM', [
        {
          name: 'signal',
          type: 'option',
          required: true
        }
      ])
      .run(function (service) {
        var options = {};
        if ( ! service ) {
          service = true;
        }
        for ( var i in arguments ) {
          if ( arguments[i] === '--signal' ) {
            options.signal = arguments[(+i + 1)];
          }
        }
        if ( /^\-\-/.test(service) ) {
          service = true;
        }
        $('../lib/stop')(service, options, domain.intercept(function (stopped) {
          if ( service === true && ! stopped.length ) {
            return console.log('Nothing is running so nothing to stop'.yellow);
          }
          stopped.forEach(function (s) {
            console.log(((s.service || s.script) + ' has been stopped').green, ('pid ' + s.pid + ' ID ' + s.log).grey);
          });
        }));
      })

    .action('reload')
      .about('Reload a script')
      .run(function (script) {
        $('../lib/reload')(script, domain.intercept(function (message) {
          console.log((script + ' has been reloaded').green);
        }));
      })

    .action('bin')
      .about('Shortcut access to the bin folder of a dependency')
      .run(function (dependency, script) {
        var args = process.argv.filter(function (arg, argi) {
          if ( argi > 4 ) {
            return true;
          }
        });
        $('../lib/bin')(dependency, script, args || [], domain.intercept(function (bin) {
          console.log(bin);
        }));
      })

    .action('config')
      .about('Set/Get dude.js configuration')
      .usage('Set a new build rule', [
          {
            name: 'set',
            required: true,
            type: 'keyword'
          },
          {
            name: 'build',
            required: true,
            type: 'keyword'
          },
          {
            name: 'build-technology',
            required: true,
            type: 'value'
          },
          {
            name: 'files',
            required: true,
            type: 'keyword'
          },
          {
            name: 'source-file',
            required: true,
            type: 'value'
          },
          {
            name: 'destination-file',
            required: true,
            type: 'value'
          }
        ])
      .usage('Get all config rules', [
        {
            name: 'get',
            required: true,
            type: 'keyword'
          }
        ])
      .run(function (verb, action) {
        if ( typeof verb !== 'string' ) {
          throw new Error('Verb must be an action');
        }

        if ( verb === 'get' ) {
          return console.log(JSON.stringify($($('path').join(process.cwd(), 'dude.json')), null, 2));
        }

        var config = $('../lib/config');

        var args = [];

        for ( var key in arguments ) {
          if ( +key ) {
            args.push(arguments[key]);
          }
        }

        args.push(function (error) {
          if ( error ) {
            throw error;
          }
          console.log('Config updated ok'.green, arguments[1]);
        });

        config[verb].apply(null, args);
      })

    .action('build')
      .about('Perform build operations')
      .arguments([
        {
          name: 'techno',
          about: 'The build technology',
          required: false,
          in: ['sass', 'browserify', 'uglify']
        },

        {
          name: 'auto',
          about: 'Whether or not use auto build',
          required: false,
          is: '--auto',
          render: { auto: true }
        }
      ])
      .usage('Build all from dude.json', [])
      .usage('Build all from dude.json in auto-way', [
        {
          name: 'auto',
          type: 'single-option',
          required: true
        }
      ])
      .usage('Build only from one techno', [
        {
          name: 'techno',
          type: 'value',
          required: true
        }
      ])
      .run(function () {

        var techno;
        var options =  {};
        
        for ( var arg in arguments ) {
          if ( /^\-\-/.test(arguments[arg]) ) {
            if ( arguments[arg] === '--auto' ) {
              options.auto = true;
            }

            if ( arguments[arg] === '--bg' ) {
              options.background = true;
            }
          }
          else if ( + arg === 0 ) {
            techno = arguments[arg];
          }
        }

        $('../lib/build')(techno, options || {},
          domain.intercept(function (built) {
            console.log('Built'.green, built);
          }));
      })

    .action('monitor')
      .about('Monitor running services/scripts')
      .usage('Monitor all running services/scripts', [])
      .run(function () {
        $('../lib/monitor')();
      })

    .exec();
});