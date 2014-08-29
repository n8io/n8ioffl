module.exports = function(app, options){
  var router = express.Router();

  router.get('/', function(req, res, next){
    return res.json({message:'There are no endpoints defined as of yet.'});
  });

  app.use('/api', router);
};