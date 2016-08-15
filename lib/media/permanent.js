/**
 * Created by qianqing on 16/8/15.
 */
var tokenized = require('./tokenized');
var permanentUrl = 'https://api.weixin.qq.com/cgi-bin/material/';
/* eslint camelcase: [2, {properties: "never"}] */

module.exports = {
  news: function (accessToken, json, cb) {
    tokenized.json(accessToken, permanentUrl + 'add_news?', json, {}, cb);
  },
  create: function (accessToken, type, file, cb, description) {
    var params = {
      type: type
    };
    switch (type) {
      case 'image':
      case 'voice':
      case 'thumb':
        break;
      case 'video':
        params.description = description;
        break;
      default :
        cb(true, {errmsg: 'Invalid type'});
        return;
    }
    tokenized.file(accessToken, permanentUrl + 'add_material?', file, params, cb);
  },

  get: function (accessToken, mediaId, cb) {
    var data = {
      media_id: mediaId
    };
    tokenized.json(accessToken, permanentUrl + 'get_material?', data, {}, cb);
  },
  remove: function (accessToken, mediaId, cb) {
    var data = {
      media_id: mediaId
    };
    tokenized.json(accessToken, permanentUrl + 'del_material?', data, {}, cb);
  },
  update: function (accessToken, data, cb) {
    tokenized.json(accessToken, permanentUrl + 'update_news?', data, {}, cb);
  }
};
