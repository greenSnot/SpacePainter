var router = require('../../router.js');
var config = require('../../config.js');
var loading = require('../../loading.js');
var request = require('../../request.js');
var template = require('art-template-native');
var gui = require('./gui.js');

import { Viewer } from '../../viewer.js';
import { Pen } from '../../pen.js';


var N_VIEWER = 2;

var work_id_to_filename = {};

var viewers = [];

var works_dom = [];

function work_on_click() {
  router.activate({
    page: 'editor',
    mode: 'preview',
    filename: work_id_to_filename[this.work_id]
  });
}

function hide_all_viewers() {
  $('.work-item').removeClass('visible');
}

function show_viewer_by_index(index) {
  $('.work-item').eq(index).addClass('visible');
}

function update_viewer(n_page) {
  loading.show();
  return request_popular_works(n_page).then(function(result) {
    var works = result.data;
    var count = result.count;
    loading.hide();
    var html = '';

    hide_all_viewers();
    for (var i = 0;i < works.length && i < N_VIEWER; ++i) {
      show_viewer_by_index(i);
      var data = works[i];
      viewers[i].work_id = data.id;
      work_id_to_filename[data.id] = data.cdn_filename;
      $(works_dom[i]).find('.work-name').text(data.name);
      viewers[i].load_from_url(config.cdn_works_path + data.cdn_filename);
    }

    gui.set_n_page(n_page, Math.ceil(count / N_VIEWER));
  });
}

function init() {
  var html = '';
  var i;
  for (i = 0; i < N_VIEWER; ++i) {
    html += template('template-discovery-work', {});
  }
  $('.works-wrap').html(html);
  for (i = 0; i < N_VIEWER; ++i) {
    var v = new Viewer({
      dom: $('.work-item .viewer-wrap')[i],
      container: $('.work-item .viewer-container')[i],
      pen: new Pen(),
      auto_rotation: 0.1,
      controls_on_click: work_on_click,
    });
    v.pause();
    v.auxiliary.show();
    viewers.push(v);
    works_dom.push($('.work-item')[i]);
  }
  gui.init(viewers, update_viewer);
}

function pause() {
  for (var i = 0; i < N_VIEWER; ++i) {
    viewers[i].pause();
  }
  gui.pause();
}

function activate(opts) {
  opts.n_page = opts.n_page || 1;
  router.update_url(opts);

  for (var i = 0; i < N_VIEWER; ++i) {
    viewers[i].activate();
  }

  update_viewer(parseInt(opts.n_page));
  gui.activate();
}

function dispose() {
  var page_name = 'discovery';
  $('.page[data-page=' + page_name + ']').html('');
}

function request_popular_works(n_page) {
  return request.post(config.get_popular_works_url, {
    type: 'popular',
    skip: (n_page - 1) * N_VIEWER,
    limit: N_VIEWER,
  }).then(function(result) {
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
  dispose: dispose,
};
