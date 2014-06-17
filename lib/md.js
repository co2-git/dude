var $ = require;

module.exports = function (md, cb) {
  var domain = $('domain').create();

  domain.on('error', function (error) {
    cb(error);
  });

  domain.run(function () {
    var stream = $('fs').createReadStream(md, { encoding: 'utf-8' });

    var parsed = '';

    stream.on('data', function (data) {
      parsed += data
        ;
    });

    stream.on('end', function () {
      cb(null, parsed);
    });
  });
};