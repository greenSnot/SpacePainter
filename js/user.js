var config = require('./config.js');

var post = function(url, data, cb) {
  $.ajax({
    url: url,
    type: 'POST',
    data: data,
    xhrFields: {
      withCredentials: true
    },
    success: cb,
  });
};

var user_basic_info;

function get_user_basic_info() {
  return user_basic_info;
}

function request_user_basic_info() {
  return new Promise(function(resolve, reject) {
    post(config.get_wechat_info_url, {}, function(result) {
      if (typeof(result) != 'object') {
        result = JSON.parse(result);
      }
      alert(JSON.stringify(result));
      if (result.code == -1) {
        post(config.get_wechat_redirect_code_url, {
          url: location.href
        }, function(result) {
          if (typeof(result) != 'object') {
            result = JSON.parse(result);
          }
          alert(JSON.stringify(result) + '!');
          if (result.code !== 0) {
            reject(result);
            return;
          }
          var callback_url = config.wechat_auth_callback_url;
          var redirect_code = result.data.redirect_code;

          location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + config.app_id + '&redirect_uri=' + encodeURI(callback_url) + '&response_type=code&scope=snsapi_userinfo&state=' + redirect_code + '#wechat_redirect';
        });
      } else if (result.code === 0) {
        resolve(result.data);
      }
    });
  });
}

function upload_work(work_base64, work_name) {
  post(config.get_work_upload_token_url, {
    work_name: work_name,
  }, function(res) {
    if (res.code !== 0) {
      alert(res.msg);
      return;
      //TODO
    }
    var token = res.data.token;
    // TODO choose proper address automatically
    //var url = 'http://upload.qiniu.com/putb64/-1';
    var url = 'http://up-z2.qiniu.com/putb64/-1/key/' + btoa(res.data.key);
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(){
      if (xhr.readyState == 4) { //error
        alert(xhr.responseText);
      }
    };
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/octet-stream');
    xhr.setRequestHeader('Authorization', 'UpToken ' + token);
    xhr.send(work_base64);
  });
}

module.exports = {
  request_user_basic_info: request_user_basic_info,
  get_user_basic_info: get_user_basic_info,
  upload_work: upload_work,
};
