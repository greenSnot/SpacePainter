var $ = require('npm-zepto');
var template = require('art-template-native');
var router = require('./router.js');
var loading = require('./loading.js');
var request = require('./request.js');
var user = require('./user.js');
var util = require('./util.js');

import { init_dialog } from './dialog.js';
import { Confirm } from './confirm.js';

function init() {
  init_dialog();
  loading.init();
  template.config('openTag', '<#');
  template.config('closeTag', '#>');

  var fast_click = require('fastclick');
  fast_click(document.body);

  router.init().then(function() {
    var query = util.get_query_from_url();
    query.page = query.page || 'discovery';

    user.init().then(function() {
      loading.hide();
      router.activate(query);
    }).catch(function(e) {
      if (e.code == -1) {
        request.wechat_login();
      } else {
        console.error(e);
        new Confirm({
          title: 'Error',
          content: e.msg
        });
      }
    });
  });
}

init();
