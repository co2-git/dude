var $ = require;

var domain = $('domain').create();

domain.on('error', function (error) {
  console.log('error'.red, error.stack.yellow);
  process.exit(1);
});

domain.run(function () {

  $('colors');

  function program () {
    this.actions = [];
    this.Action = null;
    this.Package = {};
  }

  function parseArguments(args) {
    var _args = {};

    for ( var i in args ) {
      if ( ! (+i % 2) ) {
        _args[args[i].replace(/^\-\-/, '')] = args[(+i + 1)];
      }
    }

    return _args;
  }

  function padding (len) {
    for ( var i = 0, pad = ''; i < len ; i ++, pad += ' ' );

    return pad;
  }

  program.prototype.exec = function (cliArgs) {

    this.Package = $($('path').join(this.Dirname, 'package.json'));

    try {
      this.Docs = $('fs').readdirSync($('path').join(this.Dirname, 'docs'));
    }
    catch ( error ) {
      this.Docs = [];
    }

    if ( ! cliArgs ) {
      cliArgs = process.argv;
    }

    if ( ! Object.keys(this.Package).length ) {

    }

    if ( ! cliArgs[2] || ['-h', '--help', 'help'].indexOf(cliArgs[2]) > -1 ) {

      if ( ! this.Package.bin ) {
        throw new Error('No bin found in package');
      }

      console.log();
      console.log(' ' +padding((this.Package.name.length + this.Package.version.length + this.Package.description.length + 13)).green.inverse);
      console.log(' ' + '    %s v%s | %s    '.green.inverse, this.Package.name.bold, this.Package.version, this.Package.description);
      console.log(' ' + padding((this.Package.name.length + this.Package.version.length + this.Package.description.length + 13)).green.inverse);

      console.log();
      console.log('    Help:');
      console.log();
      console.log('        %s readme'.magenta, Object.keys(this.Package.bin)[0]);
      
      this.Docs.forEach(function (doc) {
        console.log('        %s docs %s'.magenta, Object.keys(this.Package.bin)[0], doc.replace(/\.md$/, '').bold);
      }.bind(this));

      console.log();

      console.log();
      console.log('    Usage:');
      console.log();
      console.log('        %s <action> [<arguments>...]'.magenta, Object.keys(this.Package.bin)[0]);
      console.log('        %s usage <action>'.magenta, Object.keys(this.Package.bin)[0].magenta);
      console.log();


      console.log();
      console.log('    Actions:');
      console.log();

      this.actions.forEach(function (action) {
        for ( var space1 = '', i = action.name.length; i < 20 ; i ++, space1 += ' ' );

        console.log('    ' + action.name.bold.cyan + space1 + action.about);
      });

      var documentation;

      if ( this.Package.homepage ) {
        documentation = this.package.homepage;
      }

      else if ( this.Package.repository ) {
        documentation = this.Package.repository.url;
      }

      console.log();
      console.log();
      
      if ( documentation ) {
        console.log('    Full documentation at %s'.grey, documentation);
        console.log();
      }

      return;
    }

    var i, action;

    if ( cliArgs[2] === 'usage' ) {
      for ( i = 0; i < this.actions.length; i ++ ) {
        action = this.actions[i];

        if ( action.name === cliArgs[3] ) {
          action.usage.forEach(function (usage) {
            console.log();
            console.log('    ' + usage.name.bold.blue.inverse);
            console.log();
            
            process.stdout.write('        ' + (Object.keys(this.Package.bin)[0] + ' ' + cliArgs[3]).magenta + ' ');

            usage.arguments.forEach(function (arg) {
              var color = arg.required ? 'yellow' : 'grey';

              switch ( arg.type ) {
                case 'keyword':
                  process.stdout.write(arg.name[color] + ' ');
                  break;

                case 'value':
                  process.stdout.write(('<' + arg.name + '> ')[color]);
                  break;

                case 'option':
                  process.stdout.write(('--' + arg.name + ' <' + arg.name + '>')[color]);
                  break;
              }
            });

            console.log();
          }.bind(this));
          console.log();
          return;
        }
      }
    }

    if ( cliArgs[2] === 'readme' ) {
      if ( ! cliArgs[3] ) {
        $('./md')($('path').join(process.cwd(), 'README.md'),
          domain.intercept(function (md) {
            console.log(md);
          }));
      }
      return;
    }

    if ( cliArgs[2] === 'docs' ) {
      $('./md')($('path').join(this.Dirname, 'docs', cliArgs[3] + '.md'),
          domain.intercept(function (md) {
            console.log(md);
          }));
      return;
    }

    for ( i = 0; i < this.actions.length; i ++ ) {
      action = this.actions[i];

      if ( action.name === cliArgs[2] ) {
        if ( typeof action.run !== 'function' ) {
          throw new Error('No function attached to action ' + action.name);
        }

        action.run.apply(null, cliArgs.reduce(function (args, arg, argi) {
          if ( argi > 2 ) {
            args.push(arg);
          }
          return args;
        }, []));

        return;
      }
    }
  };

  program.prototype.actionExists = function(action) {
    if ( typeof action !== 'string' ) {
      throw new Error('Action name must be a string');
    }

    var exists = false;

    this.actions.forEach(function ($action) {
      if ( $action.name === action ) {
        exists = true;
      }
    });

    if ( ! exists ) {
      throw new Error('No such action: ' + action);
    }
  };

  program.prototype.dirname = function(dirname) {
    this.Dirname = dirname;
    return this;
  };

  program.prototype.action = function(action) {
    if ( typeof action !== 'string' ) {
      throw new Error('Action must be a string');
    }

    this.actions.push({
      name: action
    });

    this.Action = action;

    return this;
  };

  program.prototype.about = function(about) {
    this.actionExists(this.Action);

    if ( typeof about !== 'string' ) {
      throw new Error('About must be a string');
    }

    this.actions = this.actions.map(function (action) {
      if ( action.name === this.Action ) {
        action.about = about;
      }

      return action;
    }.bind(this));

    return this;
  };

  program.prototype.usage = function(usage, params, options) {
    this.actionExists(this.Action);

    if ( typeof usage !== 'string' ) {
      throw new Error('Missing usage name');
    }

    this.actions = this.actions.map(function (action) {
      if ( action.name === this.Action ) {
        if ( ! action.usage ) {
          action.usage = [];
        }

        if ( ! options ) {
          options = {};
        }

        action.usage.push({
          name: usage,
          arguments: params,
          options: options
        });
      }

      return action;
    }.bind(this));

    return this;
  };

  program.prototype.run = function(run) {
    this.actionExists(this.Action);

    if ( typeof run !== 'function' ) {
      throw new Error('Run must be a string');
    }

    this.actions = this.actions.map(function (action) {
      if ( action.name === this.Action ) {
        action.run = run;
      }

      return action;
    }.bind(this));

    return this;
  };

  module.exports = new program();
});