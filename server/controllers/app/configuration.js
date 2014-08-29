module.exports = function(){
  var configFileBaseName = 'config';

  // Pull in NODE_ENV from environment if set
  config.env(['NODE_ENV'])

  // Default to 'development' in case it is not provided
  config.defaults({ 'NODE_ENV': 'development' });

  // Read in any command line args for overrides
  config.argv();

  // Load environment config from file system
  var envConfig = configFileBaseName + '.' + config.get('NODE_ENV') + '.json';
  config.file({
    file: envConfig,
    dir: path.join(__dirname,'../..', 'config'),
    search: true
  });

  // Load default configuration from file system
  var defaultConfigPath = path.join(__dirname,'../..', 'config', configFileBaseName + '.base.json');
  config.file('default', defaultConfigPath);

  // Push evaluated configs values back for logging later on
  config.set('envConfig', envConfig);
  config.set('baseConfig', configFileBaseName +  '.base.json');

  // Read in known env variables
  var envVars = [{'apiKey': 'services:espnffl:apiKey'}];
  _(envVars).each(function(ev){
    var key = _(ev).keys()[0];
    var eVal = process.env[key];
    if(eVal){
      config.set(ev[key], eVal);
    }
  });

  // Check for any config validation errors
  var configValidationErrors = [];
  var configRequiredValues = config.get('__required') || [];

  for (var i = configRequiredValues.length - 1; i >= 0; i--) {
    if(!config.get(configRequiredValues[i])){
      configValidationErrors.push({
        reason: configRequiredValues[i] + ' is a required configuration value. Please add a valid value to your environment config: ' + config.get('envConfig')
      });
    }
  }

  // Set so these can be evaluated later, but before app startup
  config.set('configValidationErrors', configValidationErrors);
};