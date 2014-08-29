require('./server/controllers/app/globals'); // Load up globals variables

var app = express();
var pkg = require('./package.json');
var options = { version: pkg.version, author: pkg.author };

require('./server/controllers/app/configuration')(); // Load up config
require('./server/controllers/app/logging')(); // Set up logging

// Check for configuration validation errors, if present don't start the app
if(config.get('configValidationErrors') && config.get('configValidationErrors').length > 0){
  logger.error({configValidationError:config.get('configValidationErrors')});
  throw new Error('Application is not properly configured. See logs for details.');
}

require('./server/controllers/app/app')(app, options); // Load up app middleware
require('./server/routes')(app, options); // Load up routes
require('./server/controllers/app/init')(app); // Start up the app
