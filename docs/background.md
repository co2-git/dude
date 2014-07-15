# Enable background

    dude init --bg
    
# Start background daemon

    dude start --bg
    
# Reload background daemon

    dude reload --bg
    
# Stop background daemon

    dude stop --bg
    
# Add a new background worker

    dude do <worker-script> [<options...>]
    
## Arguments

### <worker-script>

The path to the worker's javascript file. See <values>

## Options

### --in <in>

Set execution time from now.

    dude do something-cool --in '1 hour'
    
### --every <every>

Set worker frequency.

    dude do something-cool --every day
    dude do something-cool --every '4 hours'
    
### --at <at>

Set execution time.

    dude do something-cool --at 2014-12-31H23:59:59TZ+1:00
    dude do something-cool --at 'December 31st 2014 23:59:59'
    
### --priority <priority>
