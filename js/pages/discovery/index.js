var router = require('../../router.js');
var config = require('../../config.js');
var loading = require('../../loading.js');
var request = require('../../request.js');
var template = require('art-template-native');
var gui = require('./gui.js');
var user = require('../../user.js');
var _ = require('lodash');

import { Viewer } from '../../viewer.js';
import { Pen } from '../../pen.js';

import Vue from 'vue';

var FilterTypes = require('./filter_types');

var N_VIEWER = 2;

var empty_work = {
  work_id: '',
  name: '',
  descript: '',
  visible: false,
  btn_like_visible: false,
  btn_remove_visible: false,
  viewer_id: null,
};
var cur_works = [];
var viewers = {};
var Works; // Vue instance

function hide_all_viewers() {
  for (var i in Works.works) {
    var v = viewers[Works.works[i].viewer_id];
    v.pause();
    Works.works[i].visible = false;
  }
}

function update_viewer(n_page, filter_type) {
  filter_type = filter_type || FilterTypes.popular;
  loading.show();
  return request_works(n_page, filter_type).then(function(result) {
    var works = result.data;
    var count = result.count;
    loading.hide();

    hide_all_viewers();
    for (var i = 0;i < Works.works.length; ++i) {
      Works.works[i].visible = true;

      var data = works[i];
      var v = viewers[Works.works[i].viewer_id];
      v.work_id = data._id;
      Works.works[i].work_id =  data._id;
      Works.works[i].name =  data.name;
      Works.works[i].desciption =  data.description;
      if (filter_type == FilterTypes.my_works) {
        Works.works[i].btn_like_visible = false;
        Works.works[i].btn_remove_visible = true;
      } else {
        Works.works[i].btn_like_visible = true;
        Works.works[i].btn_remove_visible = false;
      }
      //TODO likes
      v.load_from_url(config.cdn_works_path + data.cdn_filename);
      v.activate();
    }

    gui.update_filter(filter_type);
    gui.set_n_page(n_page, Math.ceil(count / N_VIEWER));
  });
}

function init() {
  var i;

  gui.init(viewers, update_viewer);

  for (i = 0; i < N_VIEWER; ++i) {
    cur_works.push(_.cloneDeep(empty_work));
  }

  Works = new Vue({
    el: '.works-wrap',
    data: {
      works: cur_works,
    },
    watch: {
      works: {
        handler: function (val, oldVal) {
        },
        deep: true
      }
    },
  });

  function work_on_click() {
    router.activate({
      page: 'editor',
      mode: 'preview',
      work_id: this.host.work_id
    });
  }

  for (i = 0; i < N_VIEWER; ++i) {
    var v = new Viewer({
      dom: $('.work-item .viewer-wrap')[i],
      container: $('.work-item .viewer-container')[i],
      pen: new Pen(),
      auto_rotation: 0.1,
      controls_on_click: work_on_click,
    });
    v.pause();
    cur_works[i].viewer_id = v.id;
    viewers[v.id] = v;
  }
  return new Promise(function(resolve, reject) {
    resolve();
  });
}

function pause() {
  hide_all_viewers();
  gui.pause();
}

function activate(opts) {
  opts.n_page = opts.n_page || 1;
  router.update_url(opts);

  update_viewer(parseInt(opts.n_page), parseInt(opts.filter));
  gui.activate();
}

function request_works(n_page, filter_type) {
  var data = {
    type: filter_type,
    skip: (n_page - 1) * N_VIEWER,
    limit: N_VIEWER,
  };
  if (filter_type === FilterTypes.my_works) {
    data.type = FilterTypes.popular;
    data.user_id = user.get_user_basic_info()._id;
  }
  return request.post(config.get_works_url, data).then(function(result) {
    if (result.code !== 0) {
      console.error(result);
      return [];
    }
    return result;
  });
}

module.exports = {
  init: init,
  pause: pause,
  activate: activate,
};
