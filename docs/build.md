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

## API Usage

    dudejs.build([String techno, Object options, Function callback]);

## Invoke from command line

    dudejs build

## Invoke from API

    dudejs.build();

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