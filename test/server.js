#! /usr/bin/env node

var $ = require;

var http = $('http');

var reloaded = 0;

var view = 0;

process.on('message', function (message) {
  if ( 'reloaded' in message ) {
    reloaded = message.reloaded;
  }
});

process.send('how many reloads?');

var server = http.createServer(function (req, res) {
	res.writeHead(200, { 'Content-Type': 'text/plain' });

  res.write('I am a forked server with pid ' + process.pid +"\r\n");
  
  res.end('DudeJS test server | Reloaded ' + reloaded + ' time(s) ~~~');

  view ++;

  process.send({ 'page view': view });
});

server.listen(process.env.PORT || 3030, function () {
  process.send({ listening: (process.env.PORT || 3030) });
});

server.on('error', function (error) {
  process.send({ error: error });
});