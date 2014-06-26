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

    # To get more info:
    dudejs usage build

## Invoke from API

    dudejs.build();

## Print available technologies

    dudejs build --print

You will get a list of the available build technologies and the options they support.

## Restrict the build to only one technology

### From command line

    dudejs build sass

### From API

    dudejs.build('sass');

## Watchers

You can have automatic builts - files are being watched and are automatically built when changed.

    # CLI
    dudejs build --auto

    // API
    dudejs.build({ auto: true });

Call `dudejs build --print` to see which technologies support auto.

## Add a new build

    # CLI
    dudejs config set build <technology> --source <source> --dest <dest>

    // API
    dudejs.config.set('build', technology, { source: source, dest: dest });

## Remove a build

    # CLI
    dudejs config unset build <technology> --source <source,...> --dest <dest>

    // API
    dudejs.config.unset('build', technology, { source: source || [source,..], dest: dest });

## View build rules

    # CLI
    dudejs config get build [<technology>]

    // API
    dudejs.config.get('build');
    dudejs.config.get('build', technology);

## Apply specifics

    # CLI
    dudejs config set build sass --source <source> --dest <dest> --output-style compressed

    // API
    dudejs.config.set('build', 'sass', {
        source: source,
        dest: dest,
        "output-style": "compressed"
    });