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

// process.on('exit', function (signal) {

// });

process.on(reloadSignal, function () {
  console.log('restarting');

  var reloaders = [];

  for ( var i = 0; i < forkNumber; i ++ ) {
    reloaders.push(function (callback) {
      forkMaster(callback);
    });
  }

  $('async').series(reloaders, domain.intercept(function () {
    console.log('restarted');
  }));
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
  });

  fork.on('exit', function (code, signal) {
    console.log({ exit: (code || signal), fork: fork });
  });
}

for ( var i = 0, fork; i < forkNumber; i ++ ) {
  forkMe();
}