var gui = require('./gui.js');
var $ = require('npm-zepto');
var config = require('../../config.js');
var storage = require('../../storage.js');

import { Viewer } from '../../viewer.js';
import { Pen } from './pen.js';

var pen = new Pen(999);
pen.set_random_color_range(0.1);

var viewer;

function active(data) {
  gui.init(viewer, pen);
  viewer.enable_gyro(true);
  viewer.active();
  if (data.filename) {
    var url = config.cdn_works_path + data.filename;
    viewer.load_from_url(url);
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
    },
    on_touch_start: function(e, x, y) {
      var self = this.host;
      if (!self.pen.is_down) {
        return;
      }
      e.preventDefault();
      if (e.touches.length > 1) {
        return;
      }
      self.set_color_by_point(this.raycaster_point_from_mouse(x, y, config.NET_SIZE), self.pen);
    },
    on_touch_end: function(e) {
      var self = this.host;
      if (!self.pen.is_down) {
        return;
      }
      e.preventDefault();
      storage.store();
      gui.update_edit_gui();
    }
  });
  pen.is_down = true;
  storage.init(viewer);
}

function pause() {
  gui.stop_listeners();
  viewer.pause();
}

function dispose() {
  gui.stop_listeners();
  viewer.pause();
  var page_name = 'editor';
  $('.page[data-page=' + page_name + ']').html('');
}

module.exports = {
  init: init,
  pause: pause,
  active: active,
  dispose: dispose,
};
