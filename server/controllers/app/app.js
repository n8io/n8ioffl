var
  morgan = require('morgan'),
  favicon = require('serve-favicon'),
  stylus = require('stylus'),
  compress = require('compression'),
  bodyParser = require('body-parser'),
  session = require('cookie-session')
  ;

module.exports = function(app, /* authentication, */ options){
  app.set('views', path.join(__dirname, '../../jade'));
  app.set('view engine', 'jade');
  app.use(morgan(config.get('app:express:logFormat') || 'tiny'));
  app.use(favicon(path.join(__dirname, '../../../client/img/favicon.png')));
  app.use(stylus.middleware({ src: path.join(__dirname, '../../../client') }));
  app.use(compress());
  app.use(express.static(path.join(__dirname, '../../../client'), { maxAge: 1000*60*60*24 /* one day */ }));
  app.use(bodyParser.json());
  app.use(session({
    name: config.get('app:name')+'.'+process.env.NODE_ENV+'.session',
    keys:config.get('session:keys'),
    maxage: 24 * 60 * 60 * 1000, // 1 day
    path: '/'
  }));

  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash());
};
