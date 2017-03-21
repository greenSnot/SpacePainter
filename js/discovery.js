var page = require('./page.js');
function init() {
}

function pause() {
}

function active() {
  $('.btn-test').on('click', function() {
    page.active({
      page: 'editor'
    });
  });
}

function dispose() {
  var page_name = 'discovery';
  $('.page[data-page=' + page_name + ']').html('');
}

module.exports = {
  init: init,
  pause: pause,
  active: active,
  dispose: dispose,
};
