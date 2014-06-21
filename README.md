dude
====

dude.js is your sidekick for your NodeJS projects.

# Install

    npm install -g dudejs

# CLI

Dudejs ships with a CLI so you can access it via terminal

    dudejs

# API

    var dudejs = require('dudejs');

# Server manager

Dudejs ships with a server manager so you can easily start/stop/reload your server scripts. It uses NodeJS built-in cluster.

    # CLI
    dudejs start server.js
    dudejs reload server.js
    dudejs stop server.js

    # API
    dude.start('server.js');
    dude.reload('server.js');
    dude.stop('server.js');

# Build tools

Dudejs ships with build support for:

- SASS
- Browserify/Watchify
- UglifyJS

All builds can be automated on watching file changes.

# Dependency manager

Dudejs ships with a dependency manager so you install/update/remove low-level dependencies. Dependencies supported:

- MongoDB
- Redis