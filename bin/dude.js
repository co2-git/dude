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
    .version(package.version)
    .option('list-all', 'list available dependencies for download')
    .option('list-installed', 'list installed dependencies')
    .option('search [<dependency>]', 'search for a dependency based on its name')
    .option('install <dependency>[@<version>]', 'install new dependency');

  program.on('--help', function () {
    console.log('  Examples:');
    console.log('');
    console.log('    $ dude-js search mongodb');
    console.log('    $ dude-js install mongodb');
    console.log('    $ dude-js start mongodb');
    console.log('    $ dude-js status mongodb');
    console.log('    $ dude-js stop mongodb');
    console.log('    $ dude-js uninstall mongodb');
    console.log('');
  });

  program.on('install', function (dependency, version) {
    var list = $('../list.json');

    var Dependency;

    list.forEach(function (dep) {
      if ( dep.slug === dependency ) {
        Dependency = dep;
      }
    });

    if ( ! version ) {
      version = Dependency.latest;
    }

    if ( ! Dependency ) {
      return console.log('No such dependency'.red, ('Dependency not found: ' + dependency).yellow);
    }

    $('../lib/install/' + dependency)(version, domain.intercept(function (version, dir) {
      console.log(('  Successfully installed ' + dependency.bold + ' version ' + version.bold).green);
    }));
  });

  program.on('list-all', function () {
    var list = $('../list.json');

    console.log();
    console.log(('  dude.js | ' + list.length + ' available dependencies for download').bold.blue);
    console.log();

    list.forEach(function (dependency) {
      console.log('  ' + dependency.name + ' ' + dependency.slug.cyan + '', '      ', dependency.about);
    });

    console.log();
  });

  program.parse(process.argv);
});