var $ = require('npm-zepto');
var router = require('../../router.js');

var btn_create;
var btn_my_works;
var btn_page_next;
var btn_page_prev;

function init() {
}

function btn_create_on_click() {
  router.active({
    page: 'editor'
  });
}

function btn_my_works_on_click() {
}

function btn_page_next_on_click() {
}

function btn_page_prev_on_click() {
}

function active() {
  btn_create = $('.btn-create');
  btn_my_works = $('.btn-my-works');
  btn_page_next = $('.btn-page-next');
  btn_page_prev = $('.btn-page-prev');

  btn_create.on('click', btn_create_on_click);
  btn_my_works.on('click', btn_my_works_on_click);
  btn_page_next.on('click', btn_page_next_on_click);
  btn_page_prev.on('click', btn_page_prev_on_click);
}

function pause() {
  btn_create.off('click', btn_create_on_click);
  btn_my_works.off('click', btn_my_works_on_click);
  btn_page_next.off('click', btn_page_next_on_click);
  btn_page_prev.off('click', btn_page_prev_on_click);
}

module.exports = {
  active: active,
  pause: pause,
};
