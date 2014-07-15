# background

`background` enables you to run task in the background. We call these tasks `background workers`.

## How it works

It is a sub/pub system powered by redis. Subscribers can publish their tasks to the channel `background`. There is one (or many) background node process that is streaming live the channels and execute the tasks. There is one background node process that is saving the performed tasks to a database. If no database is specified, data are not saved and performed tasks are removed after some time.

# Commands

## Enable background

This creates the folder `dude-bg` in the root directory of the duded project. You can skip that step if your worker files reside in a different location.

    dude init --bg
    
## Start background daemon

The sub/pub system

    dude start --bg [<options...>]
    
### Options

#### --save <db-url>

In case you want to save the channel messages, specify a connection link to connect to the database where to store the old channel messages.

    dude start --bg --save mongodb://u:p@host:port/database/collection

#### --dir <workers-dir>

Set the directory where workers script files are to be looked after

    dude start --bg --dir my/folder
    
## Reload background daemon

    dude reload --bg
    
## Stop background daemon

    dude stop --bg
    
## Add a new background worker

    dude do <worker-script> [<options...>]

### Options

#### --in `in`

Set execution time from now.

    dude do something-cool --in '1 hour'
    
#### --every `every`

Set worker frequency.

    dude do something-cool --every day
    dude do something-cool --every '4 hours'
    
#### --at `at`

Set execution time.

    dude do something-cool --at 2014-12-31H23:59:59TZ+1:00
    dude do something-cool --at 'December 31st 2014 23:59:59'
    
#### --priority <priority>

# Values

### `worker-script`

The file path to the worker's javascript file. You can omit the `.js` extension. See values:workers-dir to see where javascript files are looked for.

### `workers-dir`

The directory where workers file reside. By default, it looks for them in the folder `dude-bg` at the root directory of the current duded project -- unless specify otherwise with the option `--dir <workers-dir>`.

# Tut

In this quick tutorial, we are going to create a simple background worker that updates a file every minute and writes to it the amount of the memory used by Node in Mega Bytes at that moment.
    
## Create a new folder

    mdkir dude-tut-bg/
    cd dude-tut-bg/
    npm init
    
## Install dude

    npm install -g dude
    dude init --bg
    
## Install and start redis

    dude install --save redis
    dude start redis
    
## Start daemon

    dude start --bg
    
We can check our pending tasks

    dude bg
    
As we can see, it is (rightfully) empty.
    
    
## Create a background worker

Create the worker file. We'll call him `write-memory`.

    touch dude-bg/write-memory.js
    
Put the following code in it:

    #!/usr/bin/env node
    
    var path = require('path');
    
    var file = path.join(process.env.dude_dir, 'memory.csv');
    
    var stream = require('fs').createWriteStream(file, { flags: 'a+', encoding: 'utf-8' });
    
    stream.write((process.memoryUsage().rss / 1000000).toString() + ',');
    
    stream.on('end', function () {
      process.send('done');
    });
    
## Check our worker

    dude do-eval write-memory
    cat memory.csv
    
## Start daemon and publish worker

    dude start --bg
    dude do write-memory
    dude bg
    # [pending] write-memory
    cat memory.csv
    
## Execute worker in ten minutes

    dude do write-memory --in '10 minutes'

    
    
