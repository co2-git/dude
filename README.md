dude
====

dude starts a script in cluster mode and reloads the workers on-demand. dude is cool.

# Install

    npm install -g dude

# API

    var dude = require('dude');

# CLI

    dude

This will show you all available actions. You can get more info about each action by typing:

    dude usage <action>

# Server manager

dude ships with a server manager so you can easily start/stop/reload your server scripts written in NodeJS. It uses NodeJS built-in cluster.

    # CLI
    dude start --fork 2 --reload-on SIG_INT server.js
    dude get-status server.js
    dude reload server.js
    dude stop server.js

    # API
    dude.start('server.js');
    dude.reload('server.js');
    dude.stop('server.js');