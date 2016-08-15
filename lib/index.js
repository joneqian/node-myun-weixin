/**
 * Created by qianqing on 16/8/13.
 */
'use strict';
var redis = require("redis");

module.exports = function (wx_config, redis_config, callback) {

  redis_config = redis_config || {host: '127.0.0.1', port: 6379, db:0};

  var redis_client = redis.createClient(redis_config);
  redis_client.on("error", function (err) {
    console.error("wx redis error: " + err);
  });

  if (redis_config.db === undefined || redis_config.db === null) {
    redis_config.db = 0;
  }

  redis_client.select(redis_config.db, function() {
    callback({
      oauth: require('./oauth/index'),
      auth: require('./auth/index')(wx_config, redis_client),
      media: require('./media/index'),
      pay: require('./pay/index')
    });
  });

};
