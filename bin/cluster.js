#! /usr/bin/env node

var $ = require;

var script = process.argv[2];

if ( ! script ) {
  throw new Error('Missing script');
}

var unique = process.argv[3];

var stream = $('fs').createWriteStream($('path').join(process.cwd(), 'dude-js', 'log', unique),
  { encoding: 'utf-8', flags: 'a+' });

var options = {};

if ( process.argv[4] ) {
  options = JSON.parse(process.argv[4]);
}

var forkNumber = options.forks || $('os').cpus().length;

var reloadSignal = options.reloadSignal || 'SIGUSR2';

var reloaded = 0;

process.on('exit', function (signal) {
  stream.write($('util').inspect({ exit: { process: process.pid, signal: signal } }) + "\r\n");
});

process.on(reloadSignal, function () {
  stream.write('restarting' + "\r\n");

  reloaded ++;

  var reloaders = [];

  Object.keys(cluster.workers).forEach(function (workerID) {
    reloaders.push(function (callback) {
      this.kill();
      forkMe(callback);
    }.bind(cluster.workers[workerID]));
  });

  $('async').series(reloaders, function (error) {
    if ( error ) {
      throw error;
    }

    stream.write('restarted ' + reloaded + ' times' + "\r\n");
  });
});

var cluster = $('cluster');

cluster.setupMaster({
  exec: script,
  args: options.args || []
});

cluster
  
  .on('error', function (error) {
    stream.write($('util').inspect({ error: error }) + "\r\n");
  })
  
  .on('fork', function (fork) {
    stream.write($('util').inspect({ forked: fork }) + "\r\n");
  })

  .on('exit', function (fork, code, signal) {
    stream.write($('util').inspect({ exit: (code || signal), fork: fork }) + "\r\n");
  })
  
  .on('listening', function (fork) {
    stream.write($('util').inspect({ listening: fork }) + "\r\n");
  });

function forkMe (then) {
  var fork = cluster.fork();

  fork.on('listening', function () {
    stream.write($('util').inspect({ listening: fork }) + "\r\n");

    if ( typeof then === 'function' ) {
      then();
    }
  });

  fork.on('message', function (message) {
    stream.write($('util').inspect(message) + "\r\n");

    switch ( message ) {
      case 'how many reloads?':
        this.send({ reloaded: reloaded });
        break;
    }
  }.bind(fork));

  fork.on('exit', function (code, signal) {
    stream.write($('util').inspect({ exit: (code || signal), fork: fork }) + "\r\n");
  });
}

for ( var i = 0, fork; i < forkNumber; i ++ ) {
  forkMe();
}