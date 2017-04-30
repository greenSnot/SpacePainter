var $ = require('npm-zepto');
var config = require('./config.js');

var post = function(url, data) {
  return new Promise(function(resolve, reject) {
    $.ajax({
      url: url,
      type: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json',
      dataType: 'json',
      xhrFields: {
        withCredentials: true
      },
      timeout: 8000,
      success: resolve,
      error: reject
    });
  });
};

var get = function(url, data_type) {
  return new Promise(function(resolve, reject) {
    var d = {
      url: url,
      type: 'GET',
      xhrFields: {
        withCredentials: true
      },
      timeout: 8000,
      success: resolve,
      error: reject
    };
    if (data_type) {
      d.dataType = data_type;
    }
    $.ajax(d);
  });
};

function wechat_login() {
  post(config.get_wechat_redirect_code_url, {
    url: location.href
  }).then(function(result) {
    if (result.code !== 0) {
      reject(result);
      return;
    }
    var callback_url = config.wechat_auth_callback_url;
    var redirect_code = result.data.redirect_code;
    location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + config.app_id + '&redirect_uri=' + encodeURI(callback_url) + '&response_type=code&scope=snsapi_userinfo&state=' + redirect_code + '#wechat_redirect';
  });
}

function get_user_basic_info() {
  return new Promise(function(resolve, reject) {
    post(config.get_wechat_info_url, {}).then(function(result) {
      if (result.code === 0) {
        resolve(result.data);
      } else {
        reject(result);
      }
    });
  });
}

function get_work_info(work_id) {
  return new Promise(function(resolve, reject) {
    post(config.get_work_info_url, {
      work_id: work_id
    }).then(function(res) {
      if (res.code !== 0) {
        reject(res.msg);
        return;
      }
      resolve(res.data);
    });
  });
}

function upload_work(work_base64, work_name) {
  return new Promise(function(resolve, reject) {
    post(config.get_work_upload_token_url, {
      work_name: work_name,
    }).then(function(res) {
      if (res.code !== 0) {
        reject(res.msg);
        return;
        //TODO
      }
      var token = res.data.token;
      // TODO choose proper address automatically
      //var url = 'http://upload.qiniu.com/putb64/-1';
      var url = 'http://up-z2.qiniu.com/putb64/-1/key/' + btoa(res.data.key);
      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function(){
        if (xhr.readyState == XMLHttpRequest.DONE) {
          resolve(xhr.responseText);
        }
      };
      xhr.open('POST', url, true);
      xhr.setRequestHeader('Content-Type', 'application/octet-stream');
      xhr.setRequestHeader('Authorization', 'UpToken ' + token);
      xhr.send(work_base64);
    });
  });
}

function delete_work(work_id) {
  return new Promise(function(resolve, reject) {
    post(config.remove_work_url, {
      work_id: work_id
    }).then(function(r) {
      if (r.code !== 0) {
        reject(res.msg);
      } else {
        resolve(r);
      }
    });
  });
}

function load_img(url) {
  return new Promise(function(resolve, reject) {
    var img = document.createElement('img');
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    img.setAttribute('src', url);
    img.onload = function() {
      resolve(img);
    };
  });
}

module.exports = {
  post: post,
  get: get,

  load_img: load_img,
  upload_work: upload_work,
  get_work_info: get_work_info,
  get_user_basic_info: get_user_basic_info,
  delete_work: delete_work,
  wechat_login: wechat_login,
};
