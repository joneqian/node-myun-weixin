/**
 * Created by qianqing on 16/8/15.
 */
'use strict';
var tokenized = require('./tokenized');
var permanentUrl = 'https://api.weixin.qq.com/cgi-bin/material/';

module.exports = {
  temporary: require('./temporary'),
  permanent: require('./permanent'),
  count: function (accessToken, cb) {
    tokenized.json(accessToken, permanentUrl + 'get_materialcount?', null, {}, cb);
  },
  list: function (accessToken, type, limit, offset, cb) {
    var data = {
      type: type,
      offset: offset,
      count: limit
    };
    tokenized.json(accessToken, permanentUrl + 'batchget_material?', data, {}, cb);
  }
};
