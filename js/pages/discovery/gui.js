var $ = require('npm-zepto');
var router = require('../../router.js');

var btn_create;
var btn_my_works;
var btn_page_next;
var btn_page_prev;

var update_viewer;
var n_page;

function init(_update_viewer) {
  update_viewer = _update_viewer;
}

function btn_create_on_click() {
  router.active({
    page: 'editor'
  });
}

function btn_my_works_on_click() {
  //TODO
}

function btn_page_next_on_click() {
  set_n_page(n_page + 1);
  update_viewer(n_page);
}

function btn_page_prev_on_click() {
  set_n_page(n_page - 1);
  update_viewer(n_page);
}

function set_n_page(_n_page) {
  n_page = _n_page > 0 ? _n_page : 1;

  btn_page_next.addClass('active');
  btn_page_prev.addClass('active');
  if (n_page === 1) {
    btn_page_prev.removeClass('active');
  }

  router.update_url({
    page: 'discovery',
    n_page: n_page,
  });
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
  init: init,
  active: active,
  pause: pause,
};
