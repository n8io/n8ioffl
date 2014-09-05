var fantasyData = require('fantasydata-api')(config.get('services:fantasydata'));
module.exports = function(app, options){
  var router = express.Router();

  var fdFunctions = _(fantasyData).methods().map(function(m){
    return {
      id: m.toLowerCase(),
      name: m
    };
  });

  router.param('fn', function(req, res, next, fn){
    var invalidMessage = { message: 'Provided fn parameter is invalid.' };

    if(!fn || !fn.length){
      return res.status(412).json(invalidMessage);
    }

    var found = _(fdFunctions).findWhere({id:fn.toLowerCase()});

    if(!found){
      return res.status(412).json(invalidMessage);
    }

    req.fn = found.name;

    next();
  });

  router.param('season', function(req, res, next, season){
    if(!req.fn){
      return res.status(412).json({message:'When specifiying a season parameter, fn is also required.'});
    }

    var invalidMessage = { message: 'Provided season parameter is invalid.' };

    if(!season || !(season.toString().length === 4 || season.toString().length === 7 || season.toString().length === 8)){
      return res.status(412).json(invalidMessage);
    }

    var year = parseInt(season.substring(0, 4), 0);
    var mod = season.substring(4, 7) || 'DEF';
    if(season.toString().length === 7 || season.toString().length === 8){
      switch(mod.toUpperCase()){
        case 'REG':
        case 'PRE':
        case 'POS':
          break;
        case 'DEF':
          break;
        default:
          mod = null;
          break;
      }
    }

    if(!year || !mod || (year < 2000 && year > 2099)){
      return res.status(412).json(invalidMessage);
    }

    req.season = season.toUpperCase();

    next();
  });

  router.param('week', function(req, res, next, week){
    if(!req.season){
      return res.status(412).json({message:'When specifiying a week parameter, season is also required.'});
    }

    var invalidMessage = { message: 'Provided week parameter is invalid.' };

    if(!week || !parseInt(week, 0)){
      return res.status(412).json(invalidMessage);
    }

    req.week = week;

    next();
  });

  router.param('playerId', function(req, res, next, playerId){
    var invalidMessage = { message: 'Provided playerId parameter is invalid.' };

    if(!playerId || !parseInt(playerId, 0)){
      return res.status(412).json(invalidMessage);
    }

    req.playerId = playerId;

    next();
  });

  router.get('/:fn/:season/:week/player/:playerId', function(req, res, next){
    fantasyData[req.fn](req.season, req.week, req.playerId, function(err, results){
      if(err){
        return res.json(err);
      }

      return res.json(results);
    });
  });

  router.get('/:fn/:season/:week/:position/:column', function(req, res, next){
    fantasyData[req.fn](req.season, req.week, req.position, req.column, function(err, results){
      if(err){
        return res.json(err);
      }

      return res.json(results);
    });
  });

  router.get('/:fn/:season/player/:playerId', function(req, res, next){
    fantasyData[req.fn](req.season, req.playerId, function(err, results){
      if(err){
        return res.json(err);
      }

      return res.json(results);
    });
  });

  router.get('/:fn/:season/:week/:team', function(req, res, next){
    fantasyData[req.fn](req.season, req.week, req.team, function(err, results){
      if(err){
        return res.json(err);
      }

      return res.json(results);
    });
  });

  router.get('/:fn/player/:playerId', function(req, res, next){
    fantasyData[req.fn](req.playerId, function(err, results){
      if(err){
        return res.json(err);
      }

      return res.json(results);
    });
  });
  router.get('/:fn/:season/:week', function(req, res, next){
    fantasyData[req.fn](req.season, req.week, function(err, results){
      if(err){
        return res.json(err);
      }

      return res.json(results);
    });
  });

  router.get('/:fn/:season', function(req, res, next){
    fantasyData[req.fn](req.season, function(err, results){
      if(err){
        return res.json(err);
      }

      return res.json(results);
    });
  });

  router.get('/:fn', function(req, res, next){
    fantasyData[req.fn](function(err, results){
      if(err){
        return res.json(err);
      }

      return res.json(results);
    });
  });

  router.get('/', function(req, res, next){
    return res.status(404).send();
  });

  app.use('/api/fantasydata', router);
};