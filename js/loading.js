var $ = require('npm-zepto');

var dom = $('.loading');
function show() {
  dom.css('visibility', 'visible');
}

function hide() {
  dom.css('visibility', 'hidden');
}

module.exports = {
  show: show,
  hide: hide,
};
