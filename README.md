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

Dudejs ships with a server manager so you can easily start/stop/reload your server scripts written in NodeJS. It uses NodeJS built-in cluster.

    # CLI
    dudejs start server.js
    dudejs reload server.js
    dudejs stop server.js

    # API
    dude.start('server.js');
    dude.reload('server.js');
    dude.stop('server.js');

For more info, check out the docs at `docs/servers.md`.

# Build tools

Dudejs ships with build support for:

- SASS
- Browserify/Watchify
- UglifyJS

All builds can be automated on watching file changes.

# Dependency manager

Dudejs ships with a dependency manager so you install/update/remove low-level dependencies per-project and directory based. Dependencies supported:

- MongoDB
- Redis