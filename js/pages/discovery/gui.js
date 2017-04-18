var $ = require('npm-zepto');
var router = require('../../router.js');
var user = require('../../user.js');
var loading = require('../../loading.js');
var request = require('../../request.js');

var FilterTypes = require('./filter_types');

import { Notice } from '../../notice.js';
import { Confirm } from '../../confirm.js';

var btn_create;
var btn_remove;
var works_filter;
var works_filter_text;
var filter_dropdown;
var btn_my_works;
var btn_page_next;
var btn_page_prev;
var btn_auxiliary;
var dom_cur_page;
var avatar;

var current_filter_type = FilterTypes.popular;

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
  if ($(this).hasClass('active')) {
    n_page++;
    update_viewer(n_page, current_filter_type);
  }
}

function btn_page_prev_on_click() {
  if ($(this).hasClass('active')) {
    n_page--;
    update_viewer(n_page, current_filter_type);
  }
}

function set_n_page(_n_page, total_pages) {
  n_page = _n_page > 0 ? _n_page : 1;

  btn_page_next.addClass('active');
  btn_page_prev.addClass('active');
  if (n_page === 1) {
    btn_page_prev.removeClass('active');
  }
  if (n_page === total_pages) {
    btn_page_next.removeClass('active');
  }

  dom_cur_page.text(n_page + '/' + total_pages);

  update_url(n_page, current_filter_type);
}

function update_url(n_page, current_filter_type) {
  router.update_url({
    page: 'discovery',
    n_page: n_page,
    filter: current_filter_type,
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
  avatar.attr('src', info.wechat.headimgurl);
}

function works_filter_on_click() {
  if ($(this).hasClass('active')) {
    $(this).removeClass('active');
  } else {
    $(this).addClass('active');
  }
}

function filter_dropdown_on_click(e) {
  n_page = 1;
  works_filter.removeClass('active');
  update_filter(FilterTypes[$(this).attr('data-type')]);
  update_viewer(n_page, current_filter_type);
  e.stopPropagation();
}

function update_filter(type) {
  current_filter_type = type;
  update_url(n_page, current_filter_type);
  var text = $('.dropdown-item[data-filter-id="' + type + '"] .dropdown-text').text();
  works_filter_text.text(text);
}

function btn_remove_on_click() {
  function do_remove() {
    loading.show();
    var work_id = $(this).closest('.work-item').attr('data-id');
    request.delete_work(work_id).then(function(r) {
      loading.hide();
      new Notice({
        text: '删除成功'
      });
      update_viewer(n_page, current_filter_type);
    });
  }
  new Confirm({
    title: '提示',
    content: '确定要删除吗？',
    buttons: [
      {
        text: '取消',
        style: 'primary',
        on_click: function(e, self) {
          self.dispose();
        }
      },
      {
        text: '确定',
        style: 'primary',
        on_click: function(e, self) {
          do_remove();
          self.dispose();
        }
      }
    ],
  });
}

function activate() {
  btn_create = $('.btn-create');
  btn_remove = $('.btn-remove');
  works_filter = $('.works-filter');
  works_filter_text = $('.works-filter-text');
  filter_dropdown = $('.works-filter .dropdown-item');
  btn_my_works = $('.btn-my-works');
  btn_auxiliary = $('.page[data-page=discovery] .btn-auxiliary');
  dom_cur_page = $('.cur-page');
  avatar = $('.avatar');
  btn_page_next = $('.btn-page-next');
  btn_page_prev = $('.btn-page-prev');

  btn_create.on('click', btn_create_on_click);
  btn_remove.on('click', btn_remove_on_click);
  filter_dropdown.on('click', filter_dropdown_on_click);
  works_filter.on('click', works_filter_on_click);
  btn_my_works.on('click', btn_my_works_on_click);
  btn_page_next.on('click', btn_page_next_on_click);
  btn_page_prev.on('click', btn_page_prev_on_click);
  btn_auxiliary.on('click', btn_auxiliary_on_click);

  update_user_info(user.get_user_basic_info());
}

function pause() {
  btn_create.off('click');
  btn_remove.off('click');
  filter_dropdown.off('click');
  works_filter.off('click');
  btn_my_works.off('click');
  btn_page_next.off('click');
  btn_page_prev.off('click');
  btn_auxiliary.off('click');
}

module.exports = {
  init: init,
  activate: activate,
  set_n_page: set_n_page,
  update_filter: update_filter,
  pause: pause,
};
