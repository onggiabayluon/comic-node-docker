/**
 * Setup number of worker processes to share port which will be defined while setting up server
 */
 
 

 const setupWorkerProcesses = () => {
    
    var cluster = require( 'cluster' );
    var cCPUs   = require('os').cpus().length;

    // Create a worker for each CPU
    for( var i = 0; i < cCPUs; i++ ) {
        cluster.fork();
    }

    cluster.on( 'online', function( worker ) {
        console.log( 'Worker ' + worker.process.pid + ' is online.' );
    });
    cluster.on( 'exit', function( worker, code, signal ) {
        console.log( 'worker ' + worker.process.pid + ' died.' );
    });
};

module.exports = { setupWorkerProcesses };