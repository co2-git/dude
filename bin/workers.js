#!/usr/bin/env node

require('colors');

var domain = require('domain').create();

var format = require('util').format;

domain.on('error', function (error) {
  try {
    console.log('error'.red, error.stack.yellow);
  }
  catch ( err ) {
    console.log(error);
  }
  process.exit(8);
});

domain.run(function () {
  var package = require('../package.json');

  var help = [];

  help.push(format(' %s v%s', package.name.bold, package.version.italic));

  help.push(' ' + package.description.grey);

  help.push(format(' * Usage: %s <action> [<option>...] <script>', package.name).cyan);

  help.push(format(' # Execute a script in cluster mode').bold.blue);

  help.push(format(' %s fork script.js', package.name).yellow);

  help.push(format(' # Get script status').bold.blue);

  help.push(format(' %s status script.js', package.name).yellow);

  help.push(format(' # Reload script').bold.blue);

  help.push(format(' %s reload script.js', package.name).yellow);

  help.push(format(' # Stop script').bold.blue);

  help.push(format(' %s exit script.js', package.name).yellow);

  console.log();

  console.log(help.join("\n\n"));

  console.log();
});
