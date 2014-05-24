#!/usr/bin/node

var $ = require;

var domain = $('domain').create();

domain.on('error', function (error) {
  console.log('error', error.stack);
});

domain.run(function () {
  var program = $('commander');

  var package = $('../package.json');

  program
    .version(package.version)
    .option('install', 'Install new dependency')
    .parse(process.argv);


});