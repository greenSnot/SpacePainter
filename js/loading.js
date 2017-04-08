var $ = require('npm-zepto');

var dom;
var mask;

function init() {
  dom = $('.loading');
  mask = $('.loading-mask');
}

function show() {
  dom.css('visibility', 'visible');
  mask.show();
}

function hide() {
  dom.css('visibility', 'hidden');
  mask.hide();
}

module.exports = {
  init: init,
  show: show,
  hide: hide,
};
