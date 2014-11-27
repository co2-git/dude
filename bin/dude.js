#!/usr/bin/env node

// an alias I like to use for faster coding
var $ = require;

require('colors');

// if app was installed via git, it is possible Installer did not run `npm install`
// if ( ! )

var domain = $('domain').create();

domain.on('error', function (error) {
  try {
    console.log('error'.red, error.stack.yellow);
  }
  catch ( err ) {
    console.log(error);
  }
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
      .run(function (/* String | Null */ service) {
        var options = {};

        // @abstract    start a service or a script

        function start (service, options) {
          $('../lib/start')(service, options || '{}', domain.intercept(function (status) {
            console.log('started'.green, status);
          }));
        }

        // @abstract    parse $process.argv

        function parseArgs (args) {
          for ( var i = 4, bits; i < process.argv.length; i ++ ) {
            if ( $('util').isArray(args) ) {
              args.push(process.argv[i]);
            }
            else {
              bits = process.argv[i].split('=');
              args[bits[0]] = bits[1];
            }
          }
        }

        // if @service is missing, assume OP wants to use a list of services to automatically start from dude.json
        if ( ! service ) {
          var dude = $($('path').join(process.cwd(), 'dude.json'));

          if ( Array.isArray(dude.start) ) {
            dude.start.forEach(function (starter) {
              start(starter.service, starter.arguments);
            });
          }
        }

        // if @service is a text
        else if ( typeof service === 'string' ) {
          // if @service is a JavaScript file
          if ( /\.js$/.test(service) ) {

          }
          
          // if @service is a service name
          else {
            // use @service to fetch info about Service in list
            var list = $('../list.json');


            var Service;

            // look for service
            list.forEach(function (dep) {
              if ( dep.slug === service ) {
                Service = dep;
              }
            });

            if ( ! Service ) {
              throw new Error('No such service: ' + service);
            }

            options = Service.start['arguments-style'] || [];
          }
        
          start(service, parseArgs(options));
        }
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

    .action('config')
      .about('Set/Get dude.js configuration')
      .usage('Get all config rules', [
        {
            name: 'get',
            required: true,
            type: 'keyword'
          }
        ])
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
            name: 'source',
            required: true,
            type: 'option'
          },
          {
            name: 'dest',
            required: true,
            type: 'option'
          }
        ], {
          notes: [
            'To specify more than one file as a source, separate files with coma, such as: `--source file1,file2,file3`'
          ]
        })
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

    .action('monitor')
      .about('Monitor running services/scripts')
      .usage('Monitor all running services/scripts', [])
      .run(function () {
        $('../lib/monitor')();
      })

    .exec();
});