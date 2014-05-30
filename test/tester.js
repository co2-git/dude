module.exports = function (tests, options) {
  var $ = require;

  $('colors');

  var pkg;

  var mainFile = 'index.js';

  var main;

  var series = {};

  // Total of tests to run
  var total = 0;

  // Total of test that passed
  var ok = 0;

  // Total of passed that failed
  var ko = 0;

  // The total of tests for each section. The difference with total is that total is called when a test starts 
  var Total = 0;

  // When exiting, make sure all tests (especially asynchronous ones) have been run
  process.on('exit', function () {
    if ( total < Total ) {
      console.log(('Not all tests have been run! Missing ' + (Total - total).toString()).red.bold);
      process.exit(2);
    }
  });

  // Create the domain
  var domain = $('domain').create();

  // catch domain errors
  domain.on('error', function (error) {
    console.log('warning'.red, error.stack.yellow);
  });
  
  // Run code inside domain
  domain.run(function () {

    // Verify argument tests
    if ( ! tests || tests.constructor !== Object ) {
      throw new Error('Tests must be an object');
    }

    // Walking each test
    for ( var section in tests ) {

      // Total is the number of tests declared in each section
      Total += Object.keys(tests[section]).length;

      // Looping each test of the section and adding them to series
      series[section] = function (then) {
        
        // Printing the name of the section
        console.log((' * ' + this.section).blue.bold);

        // The tests to run in parallel for the section
        var parallels = [];

        // For each test in section, add to parallels
        for ( var test in tests[this.section] ) {
          parallels.push(function (cb) {

            this.test(domain.bind(function (error, result) {
              total ++;

              var hasError = false;

              if ( error ) {
                if ( options && typeof options.ignoreErrors === 'object' ) {
                  hasError = ! ((this.section + '.' + this.title) in options.ignoreErrors);
                }
              }

              if ( hasError ) {
                ko ++;
                console.log(('   ❌ ' + this.title).red.bold);
                console.log(error.stack.red);
                return cb(error);
              }
              ok ++;
              console.log(('   ✔ ' + this.title).green);
              cb(null, result);
            
            }.bind({
              title: this.describe,
              section: this.section
            })));

          }.bind({
            describe: test,
            test: tests[this.section][test],
            section: this.section
          }));
        }

        $('async').parallel(parallels, domain.bind(function (error, results) {
          if ( error ) {
            return then(error);
          }

          return then(null, results);
        }));

      }.bind({
        section: section
      });
    }

    $('async').series(series, domain.bind(function (error, results) {
      if ( error ) {
        console.log('error', error);
      }
      
      console.log();
      console.log((total + ' tests').blue, (ok + ' OK').green, (ko + ' KO').red);

      if ( options && typeof options.done === 'function' ) {
        options.done(error);
      }

      if ( ko ) {
        process.exit(1);
      }
      else {
        process.exit();
      }
    }));
  });
};