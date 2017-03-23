var template = require('art-template-native');
var config = require('./config.js');
template.config('openTag', '<#');
template.config('closeTag', '#>');
var pages;

function init() {
  pages = {
    editor: require('./pages/editor'),
    discovery: require('./pages/discovery')
  };
  for (var i in pages) {
    pages[i].init();
  }

  window.addEventListener('popstate', function(event) {
    if (event.state) {
      active(event.state);
    }
  }, false);
}

function pause(page_name) {
  $('.page[data-page=' + page_name + ']').removeClass('active');
  pages[page_name].pause();
}

function json_to_url_code(j) {
  var u = [];
  for (var i in j) {
    u.push(i + '=' + j[i]);
  }
  return u.join('&');
}

function url_code_to_json(u) {
  var query = {};
  if (u) {
    var data = u.split('&');
    for (var i in data) {
      var item = data[i].split('=');
      query[item[0]] = item[1];
    }
  }
  return query;
}

function active(data, replace) {
  var page_name = data.page;
  data = data || {};
  pause_active_page();
  $('.page[data-page=' + page_name + ']').addClass('active');
  pages[page_name].active(data);
  history.pushState(data, undefined, '?' + json_to_url_code(data));
}

function pause_active_page() {
  if ($('.page.active').length) {
    var active_page = $('.page.active').attr('data-page');
    pause(active_page);
  }
}

module.exports = {
  url_code_to_json: url_code_to_json,
  json_to_url_code: json_to_url_code,

  init: init,
  pause: pause,
  active: active,
};
