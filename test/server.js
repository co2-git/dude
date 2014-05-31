#! /usr/bin/env node

var $ = require;

var http = $('http');

var server = http.createServer(function (req, res) {
	res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('DudeJS test server');
});

server.listen(process.env.PORT || 3030, function () {
  process.send({ listening: (process.env.PORT || 3030) });
});