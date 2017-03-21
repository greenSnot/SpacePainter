var page = require('./page.js');
var config = require('./config.js');
var loading = require('./loading.js');
var request = require('./request.js');
var template = require('./art-template.js');

function init() {
}

function pause() {
  stop_listeners();
}

function active() {
  $('.btn-test').on('click', function() {
    page.active({
      page: 'editor'
    });
  });
  loading.show();
  request_popular_works().then(function(works) {
    var html = '';
    for (var i in works) {
      var data = works[i];
      data.work_name = data.name;
      data.id = data._id;
      data.filename = data.cdn_filename;
      html += template('template-discovery-work', data);
    }
    $('.works-wrap').html(html);
    loading.hide();
  });
  start_listeners();
}

function work_on_click(e) {
  var filename = $(this).attr('data-filename');
  page.active({
    page: 'editor',
    filename: filename
  });
}

function start_listeners() {
  $('body').delegate('.work-item', 'click', work_on_click);
}

function stop_listeners() {
  $('body').undelegate('.work-item', 'click', work_on_click);
}

function dispose() {
  var page_name = 'discovery';
  $('.page[data-page=' + page_name + ']').html('');
}

function request_popular_works() {
  return request.post(config.get_popular_works_url, {
    type: 'popular',
    skip: 0,
    limit: 10
  }).then(function(result) {
    if (result.code !== 0) {
      //TODO throw error
      return;
    }
    return result.data;
  });
}

module.exports = {
  init: init,
  pause: pause,
  active: active,
  dispose: dispose,
};
