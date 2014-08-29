module.exports = function(app, options){
  var router = express.Router();
  app.all('*', function(req, res, next){
    next();
  });

  router.get('/config', function(req, res, next){
    if(!config.get('displayConfig:enabled')) {
      return next();
    }

    if(req.query.key !== config.get('displayConfig:key')){
      return next();
    }

    return res.json(config.get());
  });

  router.get('*', function(req, res, next){
    return res.render('index', options);
  });

  app.use('/', router);
};