var $ = require;

exports.init = function (cb) {
  $('./lib/init')(cb);
};

exports.install = function (dependency, version, callback) {
  $('./lib/install')(dependency, version, callback);
};