#! /usr/bin/env node

var $ = require;

var script = process.argv[2];

if ( ! script ) {
  throw new Error('Missing script');
}

var options = {};

if ( process.argv[3] ) {
  options = JSON.parse(process.argv[3]);
}

var forkNumber = options.forks || $('os').cpus().length;

var reloadSignal = options.reloadSignal || 'SIGUSR2';

var reloaded = 0;

process.on('exit', function (signal) {
  console.log('exiting with signal', signal);
});

process.on(reloadSignal, function () {
  console.log('restarting');

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
    
    reloaded ++;

    console.log('restarted ' + reloaded + ' times');
  });
});

var cluster = $('cluster');

cluster.setupMaster({
  exec: script,
  args: options.args || []
});

cluster
  
  .on('error', function (error) {
    console.error(error);
  })
  
  .on('fork', function (fork) {
    console.log({ forked: fork });
  })

  .on('exit', function (fork, code, signal) {
    console.log({ exit: (code || signal), fork: fork });

    if ( signal === 'SIGUSR2' ) {
      console.log('workers', cluster.workers);
    }
  })
  
  .on('listening', function (fork) {
    console.log({ listening: fork });
  });

function forkMe (then) {
  var fork = cluster.fork();

  fork.on('listening', function () {
    console.log({ listening: fork });

    if ( typeof then === 'function' ) {
      then();
    }
  });

  fork.on('message', function (message) {
    console.log(message);

    switch ( message ) {
      case 'how many reloads?':
        this.send({ reloaded: reloaded });
        break;
    }
  }.bind(fork));

  fork.on('exit', function (code, signal) {
    console.log({ exit: (code || signal), fork: fork });
  });
}

for ( var i = 0, fork; i < forkNumber; i ++ ) {
  forkMe();
}