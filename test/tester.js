module.exports = function (tests, done) {
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
    if ( total !== Total ) {
      console.log(('Not all tests have been run! Missing ' + (Total - total).toString()).red.bold);
      process.exit(2);
    }
  });

  // Create the domain
  var domain = $('domain').create();

  // catch domain errors
  domain.on('error', function (error) {
    console.log('error'.red, error.stack.yellow);
    throw error;
    // console.log('error'.red, error);
    if ( ok + ko !== total || ! total ) {
      throw error;
    }
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

        for ( var test in tests[this.section] ) {
          parallels.push(function (then) {

            this.test(function (error, result) {
              total ++;

              if ( error ) {
                ko ++;
                console.log(('   ❌ ' + this.title).red.bold);
                console.log(error.stack.red);
                return then(error);
              }
              ok ++;
              console.log(('   ✔ ' + this.title).green);
              then(null, result);
            
            }.bind({
              title: this.describe
            }));

          }.bind({
            describe: test,
            test: tests[this.section][test]
          }));
        }

        $('async').parallel(parallels, function (error, results) {
          if ( error ) {
            return then(error);
          }

          return then(null, results);
        });

      }.bind({
        section: section
      });
    }

    $('async').series(series, function (error, results) {
      if ( error ) {
        console.log('error', error);
      }
      
      console.log();
      console.log((total + ' tests').blue, (ok + ' OK').green, (ko + ' KO').red);

      done(error);

      if ( ko ) {
        process.exit(1);
      }
      else {
        process.exit();
      }
    });
  });
};