# Program

dude ships with a CLI helper when you do Node modules that can be run on the terminal.

## Usage

	var program = require('dude.js').program;

	program
		
		.dirname(require('path').dirname(__dirname)) // the base directory of your app
		
		.action('do-something')
			
			.about('a very cool action')
			
			.run(function () {
				console.log('cool!');
			})

		.action('do-something-else')

			.about('another cool action')

			.run(function () {})

		.exec();

Then call your CLI:

	$ node bin/cli.js do-something
	cool!

## API

### dirname(String path)

### action(String name)

### about(String description)

### usage(String name, Array arguments)

### run(Function action)