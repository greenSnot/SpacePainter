var $ = require('npm-zepto');

var dom;

function init() {
  dom = $('.loading');
}

function show() {
  dom.css('visibility', 'visible');
}

function hide() {
  dom.css('visibility', 'hidden');
}

module.exports = {
  init: init,
  show: show,
  hide: hide,
};
