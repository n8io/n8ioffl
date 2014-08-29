module.exports = function(app, options){
  var router = express.Router();

  router.get('*', function(req, res, next){
    var jadeTemplatePath = path.join(__dirname,'../../jade/partials',_.str.trim(req.path, ['/', '\\', ' ']) || '404');

    var jadeTemplateAbs = [path.resolve(jadeTemplatePath), '.jade'].join('');

    jade.renderFile(jadeTemplateAbs, {}, function(err, html){
      if(err){
        logger.warn(err);
        return res
          .status(404)
          .json({ message: 'Could not find partial at: ' + req.path});
      }

      return res.send(html);
    })
  });

  app.use('/partials', router);
};