dude
====

dude starts a script in cluster mode and reloads the workers on-demand. dude is cool.

# Install

    npm install -g dude

## CLI

```bash
dude start --fork 2 --reload-on SIG_INT server.js
dude get-status server.js
dude reload server.js
dude stop server.js
```

## API
 
 ```js
dude.start('server.js');
dude.reload('server.js');
dude.stop('server.js');
```