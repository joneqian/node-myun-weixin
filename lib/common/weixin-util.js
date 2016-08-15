/**
 * Created by qianqing on 16/8/13.
 */
'use strict';
module.exports = {
  getNonce: function (length) {
    length = length || 32;
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var pos = chars.length;
    var nonces = [];
    var i;
    for (i = 0; i < length; i++) {
      nonces.push(chars.charAt(Math.floor(Math.random() * pos)));
    }
    return nonces.join('');
  },

  /**
   * Translate object to url parameters
   *
   * @param params
   * @returns {string}
   */
  toParam: function (params) {
    params = params || {};
    var keys = [];
    for (var k in params) {
      if (['string', 'number'].indexOf(typeof params[k]) !== -1) {
        keys.push(encodeURIComponent(k) + '=' + encodeURIComponent(params[k]));
      }
    }
    return keys.join('&');
  },

  /**
   * Marshalling object keys to be sorted alphabetically and then translated to url parameters
   *
   * @param params
   * @returns {string}
   */
  marshall: function (params) {
    params = params || {};
    var keys = Object.keys(params).sort();
    var obj = {};
    var kvs = [];
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (params[k]) {
        obj[k] = params[k];
        kvs.push(keys[i] + '=' + params[k]);
      }
    }
    return kvs.join('&');
  },
  toXml: function (params) {
    var lines = [];
    lines.push('<xml>');
    for (var k in params) {
      if (!params[k]) {
        continue;
      }
      if (typeof params[k] === 'number') {
        lines.push('<' + k + '>' + params[k] + '</' + k + '>');
      } else {
        lines.push('<' + k + '><![CDATA[' + params[k] + ']]></' + k + '>');
      }
    }
    lines.push('</xml>');
    return lines.join('');
  }
};
