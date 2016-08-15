/**
 * Created by qianqing on 16/8/15.
 */
var request = require('../common/weixin-request');
var util = require('../common/weixin-util');
var auth = require('node-weixin-auth');

/* eslint camelcase: [2, {properties: "never"}] */
/* eslint space-before-function-paren: [2, "never"] */
/* eslint-env es6 */

module.exports = {
  json: function(accessToken, url, data, params, cb) {
    params = params || {};
    params.access_token = accessToken;
    url += util.toParam(params);
    request.json(url, data, cb);
  },
  file: function(accessToken, url, file, params, cb) {
    params = params || {};
    params.access_token = accessToken;
    url += util.toParam(params);
    request.file(url, file, cb);
  },
  download: function(accessToken, url, file, params, cb) {
    params = params || {};
    params.access_token = accessToken;
    url += util.toParam(params);
    request.download(url, null, file.toString(), cb);
  }
};
