var $ = require;

module.exports = function (callback) {
  var domain = $('domain').create();

  domain.on('error', function (error) {
    callback(error);
  });

  domain.run(function () {
    console.log('  Installing MongoDB'.grey);
  });
};