module.exports = function(app, options){
  require('./partials')(app, options);
  require('./api/espnffl')(app, options);
  require('./api')(app, options);
  require('./root')(app, options);
};