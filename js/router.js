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
      activate(event.state);
    }
  }, false);
}

function pause(page_name) {
  $('.page[data-page=' + page_name + ']').removeClass('active');
  pages[page_name].pause();
}

function activate(data) {
  pause_active_page();
  update_url(data, true);
  pages[data.page].activate(data);
}

function update_url(data, append) {
  var page_name = data.page;
  data = data || {};
  $('.page[data-page=' + page_name + ']').addClass('active');
  if (append) {
    history.pushState(data, undefined, '?' + util.json_to_url_code(data));
  } else {
    history.replaceState(data, undefined, '?' + util.json_to_url_code(data));
  }
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
  activate: activate,
  update_url: update_url,
};
