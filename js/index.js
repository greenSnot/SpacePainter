var $ = require('npm-zepto');
var page = require('./page.js');
var loading = require('./loading.js');
var user = require('./user.js');

page.init();

var path_appendix = location.href.split('#')[1];
var query = page.url_code_to_json(path_appendix);

query.page = query.page || 'discovery';
page.active(query);

user.request_user_basic_info().then(function() {
  loading.hide();
});
