module.exports = function(app, options){
  var router = express.Router();

  router.get('/:league/:season/:team/roster', function(req, res, next){
    var rOptions = {
      uri: [
        config.get('services:espnffl:uri'),
        req.params.league,
        req.params.season,
        req.params.team,
        'roster'
      ].join('/'),
      qs: {
        apiKey: process.env.apiKey || config.get('services:espnffl:apiKey')
      },
      json: true
    };

    helpers.makeRequest(rOptions, function(err, results){
      helpers.handleResponse(res, err, results);
    });
  });

  router.get('/:league/:season/:noun', function(req, res, next){
    var rOptions = {
      uri: [
        config.get('services:espnffl:uri'),
        req.params.league,
        req.params.season,
        req.params.noun
      ].join('/'),
      qs: {
        apiKey: process.env.apiKey || config.get('services:espnffl:apiKey')
      },
      json: true
    };

    helpers.makeRequest(rOptions, function(err, results){
      helpers.handleResponse(res, err, results);
    });
  });

  router.get('/:league', function(req, res, next){
    var rOptions = {
      uri: [
        config.get('services:espnffl:uri'),
        req.params.league
      ].join('/'),
      qs: {
        apiKey: process.env.apiKey || config.get('services:espnffl:apiKey')
      },
      json: true
    };

    helpers.makeRequest(rOptions, function(err, results){
      helpers.handleResponse(res, err, results);
    });
  });

  router.get('/', function(req, res, next){
    return res.send(404);
  });

  app.use('/api/espnffl', router);
};