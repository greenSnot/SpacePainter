var $ = require('npm-zepto');
var page = require('./page.js');
var loading = require('./loading.js');
var request = require('./request.js');
var user = require('./user.js');

request.get('main.html').then(function(result) {
  $('.main-html')[0].outerHTML = result;
  init();
}).catch(function(e) {
  // TODO
});

function init() {
  loading.init();
  page.init();

  function load_main_html(file, callback) {
    var _doc = document.getElementsByTagName('head')[0];
    var js = document.createElement('script');
    js.setAttribute('type', 'text/javascript');
    js.setAttribute('src', file);
    _doc.appendChild(js);
    js.onload = function () {
      callback();
    };
  }

  var path_appendix = location.href.split('?')[1];
  var query = page.url_code_to_json(path_appendix);

  query.page = query.page || 'discovery';
  page.active(query);

  user.init().then(function() {
    loading.hide();
  }).catch(function(e) {
    if (e.code == -1) {
      request.wechat_login();
    } else {
      // TODO
        alert(e.msg);
    }
  });
}
