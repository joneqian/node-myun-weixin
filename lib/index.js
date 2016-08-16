/**
 * Created by qianqing on 16/8/13.
 */
'use strict';
var redis = require('redis');

module.exports = function (redis_config) {

  redis_config = redis_config || {host: '127.0.0.1', port: 6379, db: 0};

  var redis_client = redis.createClient(redis_config);
  redis_client.on('error', function (err) {
    console.error('wx redis error: ' + err);
  });

  if (redis_config.db === undefined || redis_config.db === null) {
    redis_config.db = 0;
  }

  redis_client.select(redis_config.db, function () {

  });
  return {
    oauth: require('./oauth/index'),
    auth: require('./auth/index')(redis_client),
    media: require('./media/index'),
    pay: require('./pay/index')
  };
};
