var $ = require('npm-zepto');
var router = require('../../router.js');
var user = require('../../user.js');

var btn_create;
var btn_my_works;
var btn_page_next;
var btn_page_prev;
var btn_auxiliary;
var avatar;

var update_viewer;
var viewers;
var n_page;

function init(_viewers, _update_viewer) {
  viewers = _viewers;
  update_viewer = _update_viewer;
}

function btn_create_on_click() {
  router.activate({
    page: 'editor',
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

function btn_auxiliary_on_click(e) {
  var i;
  if ($(this).hasClass('active')) {
    $(this).removeClass('active');
    for (i in viewers) {
      viewers[i].auxiliary.hide();
    }
  } else {
    $(this).addClass('active');
    for (i in viewers) {
      viewers[i].auxiliary.show();
    }
  }
}

function update_user_info(info) {
  avatar.attr('src', info.headimgurl);
}

function activate() {
  btn_create = $('.btn-create');
  btn_my_works = $('.btn-my-works');
  btn_auxiliary = $('.page[data-page=discovery] .btn-auxiliary');
  avatar = btn_my_works.find('.avatar');
  btn_page_next = $('.btn-page-next');
  btn_page_prev = $('.btn-page-prev');

  btn_create.on('click', btn_create_on_click);
  btn_my_works.on('click', btn_my_works_on_click);
  btn_page_next.on('click', btn_page_next_on_click);
  btn_page_prev.on('click', btn_page_prev_on_click);
  btn_auxiliary.on('click', btn_auxiliary_on_click);

  update_user_info(user.get_user_basic_info());
}

function pause() {
  btn_create.off('click');
  btn_my_works.off('click');
  btn_page_next.off('click');
  btn_page_prev.off('click');
  btn_auxiliary.off('click');
}

module.exports = {
  init: init,
  activate: activate,
  set_n_page: set_n_page,
  pause: pause,
};
