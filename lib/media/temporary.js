/**
 * Created by qianqing on 16/8/15.
 */
var tokenized = require('./tokenized');
var temporaryUrl = 'https://api.weixin.qq.com/cgi-bin/media/';
/* eslint camelcase: [2, {properties: "never"}] */

module.exports = {
  create: function (accessToken, type, file, cb) {
    tokenized.file(accessToken, temporaryUrl + 'upload?', file, {type: type}, cb);
  },
  get: function (accessToken, mediaId, file, cb) {
    tokenized.download(accessToken, temporaryUrl + 'get?', file, {media_id: mediaId}, cb);
  }
};
