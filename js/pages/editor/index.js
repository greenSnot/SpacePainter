var gui = require('./gui.js');
var $ = require('npm-zepto');
var config = require('../../config.js');
var storage = require('../../storage.js');
var request = require('../../request.js');

import { Viewer } from '../../viewer.js';
import { Pen } from '../../pen.js';

var pen = new Pen();

var viewer;

function activate(router_data) {
  router_data.mode = router_data.mode || 'edit';
  gui.activate(router_data, viewer, pen);
  viewer.activate();
  if (router_data.work_id) {
    request.get_work_info(router_data.work_id).then(function(data) {
      var url = config.cdn_works_path + data.cdn_filename;
      viewer.load_from_url(url);
    }).then(function(r) {
      storage.init(viewer);
    });
  } else {
    storage.init(viewer);
  }
}

function init() {
  var is_changed = false;
  viewer = new Viewer({
    dom: $('.viewer-wrap.main')[0],
    container: $('.viewer-container.main')[0],
    pen: pen,
    on_touch_move: function(e, x, y) {
      var self = this.host;
      if (!self.pen.is_down) {
        return;
      }
      e.preventDefault();
      self.set_color_by_point(this.raycaster_point_from_mouse(x, y, config.NET_SIZE), self.pen);
      self.engine.mouse_sensitivity = 0;
      is_changed = true;
    },
    on_touch_end: function(e) {
      var self = this.host;
      if (!self.pen.is_down || !is_changed) {
        return;
      }
      is_changed = false;
      e.preventDefault();
      storage.store();
      gui.update_edit_gui();
      self.engine.mouse_sensitivity = 0.3;
    }
  });
  viewer.pause();
}

function pause() {
  gui.pause();
  viewer.pause();
}

function dispose() {
  gui.pause();
  viewer.pause();
  var page_name = 'editor';
  $('.page[data-page=' + page_name + ']').html('');
}

module.exports = {
  init: init,
  pause: pause,
  activate: activate,
  dispose: dispose,
};
