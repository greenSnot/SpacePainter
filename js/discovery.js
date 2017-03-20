var page = require('./page.js');
function init() {
  $('.btn-test').on('click', function() {
    page.active('editor');
  });
}

function pause() {
}

function active() {
}

module.exports = {
  init: init,
  pause: pause,
  active: active,
};
