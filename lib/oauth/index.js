/**
 * Created by qianqing on 16/8/13.
 */
'use strict';

var assert = require('assert');
var restful = require('../common/weixin-request');
var util = require('../common/weixin-util');

var oauth = {
  /**
   * Build parameters into oauth2 url
   * @param params
   * @returns {string}
   */
  buildUrl: function (params) {
    var oauthUrl = 'https://open.weixin.qq.com/connect/oauth2/authorize';
    return oauthUrl + '?' + util.toParam(params) + '#wechat_redirect';
  },

  /**
   *  Step 1: Create a url for weixin oauth give state, scope and type
   *
   * @param state     User defined state to check use validation
   * @param scope     The scope of user info which app want to have
   * @param type      Response type of weixin api, currently on 'code' is supported
   * @returns {*}
   */
  createURL: function (wx_config, redirectUri, state, scope, type) {
    assert((scope >= 0) && (scope <= 1));
    assert(state !== null);
    type = 0;
    var params = {
      appid: wx_config.app.id,
      redirect_uri: redirectUri,
      // Only one type currently
      response_type: ['code'][type],
      scope: ['snsapi_base', 'snsapi_userinfo'][scope],
      state: state
    };
    return this.buildUrl(params);
  },

  /**
   * Refresh authorization info when the access token expires
   * @param appId
   * @param refreshToken
   * @param cb
   */

  refresh: function (wx_config, cb) {
    var oauthUrl = 'https://api.weixin.qq.com/sns/oauth2/refresh_token';
    var params = {
      appId: wx_config.app.id,
      grant_type: 'refresh_token',
      refresh_token: wx_config.app.refreshToken
    };
    var url = oauthUrl + '?' + util.toParam(params);
    restful.request(url, null, cb);
  },

  /**
   * Get user profile
   *
   * @param openId
   * @param accessToken
   * @param cb
   */
  profile: function (wx_config, openId, cb) {
    var oauthUrl = 'https://api.weixin.qq.com/sns/userinfo';
    var params = {
      access_token: wx_config.app.accessToken,
      openid: openId,
      lang: 'zh_CN'
    };
    var url = oauthUrl + '?' + util.toParam(params);
    restful.request(url, null, cb);
  },

  /**
   * Validate if the accessToken is still valid
   * @param openid
   * @param accessToken
   * @param cb
   */
  validate: function (wx_config, openid, cb) {
    var oauthUrl = 'https://api.weixin.qq.com/sns/auth';
    var params = {
      access_token: wx_config.app.accessToken,
      openid: openid
    };
    var url = oauthUrl + '?' + util.toParam(params, true);
    restful.request(url, null, function (error, json) {
      if (json.errcode) {
        cb(false);
      } else {
        cb(true);
      }
    });
  },

  /**
   * Get access token from server
   *
   * @param appToken
   * @param params
   * @param cb
   */
  tokenize: function (wx_config, params, cb) {
    var oauthUrl = 'https://api.weixin.qq.com/sns/oauth2/access_token';
    params.access_token = wx_config.app.accessToken;
    var url = oauthUrl + '?' + util.toParam(params) + '#wechat_redirect';
    restful.request(url, null, cb);
  },

  /**
   * Get access token after code retrieved
   * @param app
   * @param code
   * @param cb
   */
  authorize: function (wx_config, code, cb) {
    var params = {
      appid: wx_config.app.id,
      secret: wx_config.app.secret,
      grant_type: 'authorization_code',
      code: code
    };
    this.tokenize(params, function (error, json) {
      if (error) {
        cb(true, error);
      } else {
        cb(false, json);
      }
    });
  },

  /**
   * Callback when oauth from weixin is successful.
   *
   * @param app
   * @param code
   * @param cb
   */
  success: function (wx_config, code, cb) {
    this.authorize(code, function (error, json) {
      if (error) {
        cb(true, json);
        return;
      }
      if (json.openid) {
        wx_config.app.accessToken = json.access_token;
        wx_config.app.refreshToken = json.refresh_token;
        if (cb) {
          cb(false, json);
        }
        return;
      }
      cb(true, json);
    });
  }
};

module.exports = oauth;
