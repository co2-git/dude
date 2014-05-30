var $ = require;

module.exports = function (str, options) {
  return str
    .replace(/\{\{os\.type\}\}/g, $('./get-system-info').type)
    .replace(/\{\{os\.arch\}\}/g, $('./get-system-info').arch)
    .replace(/\{\{dependency\.version\}\}/g, options.version);
};