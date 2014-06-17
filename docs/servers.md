# Servers

dude ships with a manager for your HTTP/TCP servers. It uses node clusters so you can reload your servers with zero second downtime.

## CLI Usage

	dudejs start server.js
	dudejs reload server.js
	dudejs stop server.js

## API usage

	dudejs.start('server.js');
	dudejs.reload('server.js');
	dudejs.stop('server.js');

## Specify the number of workers

	dudejs start server.js --fork 2

## Callback on worker died

	dudejs start server.js --on