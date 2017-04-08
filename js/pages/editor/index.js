var gui = require('./gui.js');
var $ = require('npm-zepto');
var config = require('../../config.js');
var storage = require('../../storage.js');

import { Viewer } from '../../viewer.js';
import { Pen } from '../../pen.js';

var pen = new Pen();

var viewer;

function activate(router_data) {
  router_data.mode = router_data.mode || 'edit';
  gui.activate(router_data, viewer, pen);
  viewer.activate();
  if (router_data.filename) {
    var url = config.cdn_works_path + router_data.filename;
    viewer.load_from_url(url);
    storage.store();
  }
}

function init() {
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
    },
    on_touch_end: function(e) {
      var self = this.host;
      if (!self.pen.is_down) {
        return;
      }
      e.preventDefault();
      storage.store();
      gui.update_edit_gui();
      self.engine.mouse_sensitivity = 0.3;
    }
  });
  viewer.pause();
  storage.init(viewer);
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
