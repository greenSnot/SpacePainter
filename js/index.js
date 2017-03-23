var $ = require('npm-zepto');
var router = require('./router.js');
var loading = require('./loading.js');
var request = require('./request.js');
var user = require('./user.js');

request.get('main.html').then(function(result) {
  $('.main-html')[0].outerHTML = result;
  init();
}).catch(function(e) {
  reload();
});

function init() {
  loading.init();
  router.init();

  var fast_click = require('fastclick');
  fast_click(document.body);

  var path_appendix = location.href.split('?')[1];
  var query = router.url_code_to_json(path_appendix);

  query.page = query.page || 'discovery';
  router.active(query);

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
