var $ = require('npm-zepto');
var template = require('art-template-native');
var router = require('./router.js');
var loading = require('./loading.js');
var request = require('./request.js');
var user = require('./user.js');
var util = requrie('./util.js');

request.get('main.html').then(function(result) {
  $('.main-html')[0].outerHTML = result;
  init();
}).catch(function(e) {
  location.reload();
});

function init() {
  loading.init();
  router.init();

  template.config('openTag', '<#');
  template.config('closeTag', '#>');

  var fast_click = require('fastclick');
  fast_click(document.body);

  var query = util.get_query_from_url();
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
