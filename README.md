workers.js
==========

Starts a script in cluster mode. Useful for reloading HTTP server with zero-second downtime. 

# Install

    npm install -g workers.js

## CLI

```bash
workers.js fork server.js
workers.js status server.js
workers.js reload server.js
workers.js exit server.js
```

## API
 
 ```js

var workers = require('workers.js');

workers.start('server.js');
workers.status('server.js');
workers.reload('server.js');
workers.stop('server.js');
```