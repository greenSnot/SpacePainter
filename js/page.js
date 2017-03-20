var pages;

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

function active(page_name, data) {
  data = data || {};
  pause_active_page();
  $('.page[data-page=' + page_name + ']').addClass('active');
  pages[page_name].active();
  history.pushState(data, undefined, '/#page=' + page_name + '&' + json_to_url_code(data));
}

function pause_active_page() {
  if ($('.page.active').length) {
    var active_page = $('.page.active').attr('data-page');
    pause(active_page);
  }
}

function init() {
  pages = {
    editor: require('./editor.js'),
    discovery: require('./discovery.js')
  };
  for (var i in pages) {
    pages[i].init();
  }
  (function(history) {
    var pushState = history.pushState;
    history.pushState = function(state) {
      if (typeof history.onpushstate == "function") {
        history.onpushstate({state: state});
      }
      // maybe call onhashchange e.handler
      return pushState.apply(history, arguments);
    };
  })(window.history);
}

module.exports = {
  url_code_to_json: url_code_to_json,
  json_to_url_code: json_to_url_code,

  init: init,
  pause: pause,
  active: active,
};
