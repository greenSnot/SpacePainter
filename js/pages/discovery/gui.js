var $ = require('npm-zepto');
var router = require('../../router.js');
var user = require('../../user.js');
var loading = require('../../loading.js');
var request = require('../../request.js');

var FilterTypes = require('./filter_types');

import { Notice } from '../../notice.js';
import { Confirm } from '../../confirm.js';
import Vue from 'vue';

var current_filter_type = FilterTypes.popular;

var update_viewer;
var viewers;
var n_page;

var components = {};

function init(_viewers, _update_viewer) {
  viewers = _viewers;

  Vue.component('work', {
    template: '#template-work',
    props: [
      'work_id',
      'visible',
      'btn_remove_visible',
      'btn_like_visible',
      'description',
      'name'
    ],
    methods: {
      like: function(e) {
        //TODO
      },
      remove: function(e) {
        var el = e.target;
        var work_id = this.work_id;
        function do_remove() {
          loading.show();
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
      },
    }
  });

  update_viewer = _update_viewer;

  components.works_filter = new Vue({
    el: '.works-filter',
    data: {
      active: false,
      text: '',
    },
    methods: {
      toggle: function() {
        this.active = !this.active;
      },
      on_click: function(e) {
        var el = e.target;
        this.toggle();
        n_page = 1;
        update_filter(FilterTypes[$(el).closest('.dropdown-item').attr('data-type')]);
        update_viewer(n_page, current_filter_type);
        e.stopPropagation();
      }
    }
  });

  components.btn_page_next = new Vue({
    el: '.btn-page-next',
    data: {
      active: false,
    },
    methods: {
      on_click: function() {
        if (this.active) {
          n_page++;
          update_viewer(n_page, current_filter_type);
        }
      }
    }
  });

  components.btn_page_prev = new Vue({
    el: '.btn-page-prev',
    data: {
      active: false,
    },
    methods: {
      on_click: function() {
        if (this.active) {
          n_page--;
          update_viewer(n_page, current_filter_type);
        }
      }
    }
  });

  components.btn_create = new Vue({
    el: '.btn-create',
    data: {
      visible: false,
    },
    methods: {
      on_click: function() {
        router.activate({
          page: 'editor',
        });
      }
    }
  });

  components.cur_page = new Vue({
    el: '.cur-page',
    data: {
      n_page: 0,
      total_pages: 0,
    },
  });

  components.btn_auxiliary = new Vue({
    el: '.page[data-page=discovery] .btn-auxiliary',
    data: {
      active: false,
    },
    methods: {
      toggle: function() {
        this.active = !this.active;
        this.update();
      },
      update: function() {
        if (this.active) {
          show_all_auxiliary();
        } else {
          hide_all_auxiliary();
        }
      }
    }
  });
}

function hide_all_auxiliary() {
  for (var i in viewers) {
    viewers[i].auxiliary.hide();
  }
}

function show_all_auxiliary() {
  for (var i in viewers) {
    viewers[i].auxiliary.show();
  }
}

function set_n_page(_n_page, total_pages) {
  n_page = _n_page > 0 ? _n_page : 1;

  components.btn_page_next.active = true;
  components.btn_page_prev.active = true;
  if (n_page === 1) {
    components.btn_page_prev.active = false;
  }
  if (n_page === total_pages) {
    components.btn_page_next.active = false;
  }

  components.cur_page.n_page = n_page;
  components.cur_page.total_pages = total_pages;

  update_url(n_page, current_filter_type);
}

function update_url(n_page, current_filter_type) {
  router.update_url({
    page: 'discovery',
    n_page: n_page,
    filter: current_filter_type,
  });
}

function update_user_info(info) {
  $('.avatar').attr('src', info.wechat.headimgurl);
}

function update_filter(type) {
  current_filter_type = type;
  update_url(n_page, current_filter_type);
  var text = $('.dropdown-item[data-filter-id="' + type + '"] .dropdown-text').text();
  components.works_filter.text = text;
}

function activate() {
  update_user_info(user.get_user_basic_info());
}

function pause() {
}

module.exports = {
  init: init,
  activate: activate,
  set_n_page: set_n_page,
  update_filter: update_filter,
  pause: pause,
};
