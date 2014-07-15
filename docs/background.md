# Commands

## Enable background

    dude init --bg [<options...>]
    
### Options

#### --dir <workers-dir>

Set the directory where workers script files are to be looked after

    dude init --bg --dir my/folder
    
## Start background daemon

    dude start --bg [<options...>]
    
### Options

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
