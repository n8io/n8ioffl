logger = null;
var bunyan = require('bunyan');
var Bunyan2Loggly = require('bunyan-loggly').Bunyan2Loggly;
module.exports = function(){
  var streams = [];

  if(config.get('logging:console:enabled')){
    streams.push({
      level: config.get('logging:console:level') || 'info',
      stream: process.stdout
    });
  }

  if(config.get('logging:file:enabled')){
    streams.push(_.omit(config.get('logging:file'), 'enabled'));
  }

  if(config.get('logging:loggly:enabled')){
    streams.push({
      type: 'raw',
      stream: new Bunyan2Loggly(_.omit(config.get('logging:loggly'), 'enabled'))
    });
  }

  logger = bunyan.createLogger({
    name: config.get('app:name') || 'log name is not set!',
    streams: streams,
    serializers: bunyan.stdSerializers
  });

  logger.log = logger.info; // Monkey-patch logger.log
};