module.exports = function(app){
  var http = require('http');
  var https = require('https');

  // Set max sockets
  http.globalAgent.maxSockets = config.get("app:maxHttpSockets") || 25;
  https.globalAgent.maxSockets = config.get("app:maxHttpsSockets") || 25;

  // Set up the unhandled exception wrapper for the app
  var appExceptionHandler = require('domain').create();
  appExceptionHandler.on('error', function(err){
    logger.fatal(err);
    throw err;
  });

  process.on('SIGINT', function(){
    mongoose.connection.close(function(){
      logger.info('Closed database connection after unexpected application termination.');
      process.exit(0);
    });
  });

  var port = process.env.PORT || config.get('app:port') || 3000; // Set port for app
  appExceptionHandler.run(function(){
    var dbUri = [config.get('database:mongoose:uri'), config.get('database:mongoose:database')].join('/');
    async.series({
      connectToDb: function(callback){
        // mongoose.connect(dbUri);
        // mongoose.connection.on('connected', function(){
        //   callback();
        // });
        // mongoose.connection.on('error', function(){
        //   var err = new Error('Failed to open a connection to the database.');
        //   callback(err);
        // });
        // mongoose.connection.on('disconnected', function(){
        //   logger.info('Database connection is now closed.');
        // });
        callback();
      }
    },
    function(err, results){
      if(err){
        throw err;
        return;
      }

      startApp();
    });

    function startApp(){
      app.listen(port, config.get('app:host'), function(){ // Fire up the app
        logger.debug("Debug logging enabled.");
        logger.info('Configuration loaded using: ['+config.get('baseConfig')+', '+config.get('envConfig')+']');
        // logger.info('Database connection now open at:', dbUri);
        logger.info("Application (" + config.get('app:name') + ") started on "+config.get('app:host')+':'+port);
      });
    }
  });
};