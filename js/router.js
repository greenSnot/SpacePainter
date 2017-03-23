var config = require('./config.js');
var util = require('./util.js');
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

function active(data, replace) {
  var page_name = data.page;
  data = data || {};
  pause_active_page();
  $('.page[data-page=' + page_name + ']').addClass('active');
  pages[page_name].active(data);
  history.pushState(data, undefined, '?' + util.json_to_url_code(data));
}

function pause_active_page() {
  if ($('.page.active').length) {
    var active_page = $('.page.active').attr('data-page');
    pause(active_page);
  }
}

module.exports = {
  init: init,
  pause: pause,
  active: active,
};
