module.exports = function(app, options){
  var router = express.Router();

  router.get('/:league/:season/:team/roster', function(req, res, next){
    async.waterfall([
      /* getRoster: */ function(callback){
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
          if(err){
            return callback(err, null);
          }

          return callback(null, results.body);
        });
      },
      /* getPlayerInfo: */ function(data, callback){
        var ids = _(data.roster.starters).pluck('id');
        _(data.roster.bench).each(function(p){
          ids.push(p.id);
        });

        var rOptions = {
          uri: [
            config.get('services:espnnfl:uri'),
            'player',
            'search'
          ].join('/'),
          qs: {
            id: ids.join(','),
            apiKey: process.env.apiKey_espnnfl || config.get('services:espnnfl:apiKey')
          },
          json: true
        };

        helpers.makeRequest(rOptions, function(err, results){
          if(err){
            return callback(err, null);
          }

          var resp = results.body;

          data.roster.starters = _(data.roster.starters).each(function(s){
            var found = _(resp).findWhere({id:s.id});

            if(!found) return;

            s = _.extend(found, s);
          });

          data.roster.bench = _(data.roster.bench).each(function(b){
            var found = _(resp).findWhere({id:b.id});

            if(!found) return;

            b = _.extend(b, found);
          });

          return callback(null, data);
        });
      }
    ],
    function(err, results){
      if(err){
        return res.status(500).json({message: 'Could not retrieve roster at this time. See logs for details.'});
      }

      return res.json(results);
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