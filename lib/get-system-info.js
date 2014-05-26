var osType, osArch,
  $ = require;

switch ( $('os').type() ) {
  case 'Linux':
    osType = 'linux';
    break;

  default:
    throw new Error('We are sorry. As a beta version, we only support Linux for the moment :(');  
}

switch ( $('os').arch() ) {
  case 'x64':
    osArch = 'x86_64';
    break;

  default:
    throw new Error('We are sorry. As a beta version, we only support 64 bits architecture for the moment :(');
}

exports.type = osType;
exports.arch = osArch;