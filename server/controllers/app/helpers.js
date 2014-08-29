var helpers = function(){};

helpers.makeRequest = function(rOptions, callback){
  request(rOptions, function(err, results){
    if(err){
      return callback(err);
    }

    return callback(null, results);
  });
};

helpers.handleResponse = function(res, err, results){
  if(err){
    logger.error(err);
    return res.status(err.statusCode || (results && results.statusCode ? results.statusCode : 500));
  }

  return res.status(results.statusCode || 200).json(results.body);
};

module.exports = helpers;