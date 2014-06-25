# Servers

dude ships with a manager for your HTTP/TCP servers written in NodeJS. It uses node clusters so you can reload your servers with zero second downtime.

## CLI Usage

	dudejs start server.js
	dudejs reload server.js
	dudejs stop server.js

## API usage

	dudejs.start('server.js');
	dudejs.reload('server.js');
	dudejs.stop('server.js');

## Specify the number of workers

	$ dudejs start server.js --forks 2

	dudejs.start('server.js', { forks: 2 });

## Script identifier

Your script name MUST end by `.js`. You can identify your script instance by its log ID (via `dudejs running`) or by its name (here, `server.js`, also retrievable via `dudejs running`)

## Callback on worker died

	$ dudejs start server.js --rescue rescue.js

	dudejs.start('server.js', { rescue: 'rescue.js' });

	// or you can pass a function

	dudejs.start('server.js', { rescue: function (code, signal, error, worker) {

	}});