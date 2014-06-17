# Build

You can use `dude` to perform various build operations.

## Supported technologies

- Sass
- Browserify
- Uglify

## How it works

When invoking `build`, it will look in `dude.json` for the label `build`. For example:

    {
    	"build": {
            "sass": [
                {
                    "source": "file.scss",
                    "dest": "file.css"
                }
            ],
            "uglify": [
                {
                    "source": ["file1.js", "file2.js"],
                    "dest": "output.min.js"
                }
            ]
        }
    }

You can now invoke build to build the files.

Not that source can be a string or an array.

## API Usage

    dudejs.build([String techno, Object options, Function callback]);

## Invoke from command line

    dudejs build

## Invoke from API

    dudejs.build();

## Print available technologies

    dudejs build --print

## Restrict the build to only one technology

### From command line

    dudejs build sass

### From API

    dudejs.build('sass');

## Restrict the build to some technologies

    # command line
    dudejs build sass browserify

    // API
    dudejs.build(['sass', 'browserify']);

## Watchers

You can have automatic builts - files are being watched and are automatically built when changed.

    # CLI
    dudejs build --auto

    // API
    dudejs.build({ auto: true });

## Add a new build

    # CLI
    dudejs config set build <technology> --source <source> --dest <dest>

    // API
    dudejs.config.set('build', technology, { source: source, dest: dest });

## Remove a build

    # CLI
    dudejs config unset build <technology> --source <source> --dest <dest>

    // API
    dudejs.config.unset('build', technology, { source: source, dest: dest });

## View build rules

    # CLI
    dudejs config get build [<technology>]

    // API
    dudejs.config.get('build');
    dudejs.config.get('build', technology);

## Technology specify

You can view what are the specifics of each technology

    # CLI
    dudejs help build-specifics <techno>

    // API
    dudejs.help('build-specifics', techno);

For example:

    # CLI
    $ dudejs help build-specifics sass
    --source String or Array [Required]
    --dest String [Required]
    --output-style [compressed] [Optional]

    // API
    dudejs.help('build-specifics', 'sass');
    {
        "source": {
            "type": ["String", "Array"],
            "required": true
        },


        "dest": {
            "type": "String",
            "required": true
        },

        "output-style": {
            "type": { "String": ["compressed"] },
            "required": false
        }
    }

## Apply specifics

    # CLI
    dudejs config set build sass --source <source> --dest <dest> --output-style compressed

    // API
    dudejs.config.set('build', 'sass', {
        source: source,
        dest: dest,
        "output-style": "compressed"
    });