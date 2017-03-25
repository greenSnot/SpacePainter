var Snot = require('snot.js');
var gui = require('./gui.js');
var storage = require('./storage.js');
var util = Snot.util;
var THREE = Snot.THREE;
var $ = require('npm-zepto');
var auxiliary = require('./auxiliary.js');

import { Pen } from './pen.js';
var set_color_by_point = require('./mesh.js').set_color_by_point;
var init_mesh = require('./mesh.js').init;

var NET_SIZE = 100;
var NET_DIVISION = 5;

var pen = new Pen(0, 1, 0.6);
pen.set_random_color_range(0.1);

var pause_flag = true;

var viewer;

function on_touch_move(e, x, y) {
  e.preventDefault();
  set_color_by_point(viewer.raycaster_point_from_mouse(x, y, NET_SIZE), pen);
}

function raycaster_compute(x, y) {
  var intersects = viewer.raycaster.intersectObjects(viewer.suspects_for_raycaster);
  var point = util.standardlization(intersects[0].point, viewer.clicks_depth);
  return {
    point: point,
    intersects: intersects
  };
}

function on_touch_start(e, x, y) {
  e.preventDefault();
  if (e.touches.length > 1) {
    return;
  }
  set_color_by_point(viewer.raycaster_point_from_mouse(x, y, NET_SIZE), pen);
}

function on_touch_end(e) {
  e.preventDefault();
  storage.store();
  gui.update_edit_gui();
}

function update() {
  if (!pause_flag) {
    gui.update_fps();
    viewer.update();
    requestAnimationFrame(update);
  }
}

function init_viewer() {
  var obj_triangle_net = {
    id: 'triangle_net',
    mesh_generator: function () {
      var geo = new THREE.IcosahedronBufferGeometry(NET_SIZE, NET_DIVISION);
      var triangle_net = new THREE.Mesh(
        geo,
        new THREE.MeshBasicMaterial({color: 0xffffff, vertexColors: THREE.VertexColors, side: THREE.DoubleSide})
      );

      geo.addAttribute('color', new THREE.BufferAttribute(new Float32Array(geo.attributes.position.array.length), 3 ));

      var faces = [];
      for (var i = 0, j = geo.attributes.position.array.length / 9;i < j; ++i) {
        var v1_x = geo.attributes.position.array[i * 9];
        var v1_y = geo.attributes.position.array[i * 9 + 1];
        var v1_z = geo.attributes.position.array[i * 9 + 2];

        var v2_x = geo.attributes.position.array[i * 9 + 3];
        var v2_y = geo.attributes.position.array[i * 9 + 4];
        var v2_z = geo.attributes.position.array[i * 9 + 5];

        var v3_x = geo.attributes.position.array[i * 9 + 6];
        var v3_y = geo.attributes.position.array[i * 9 + 7];
        var v3_z = geo.attributes.position.array[i * 9 + 8];

        faces.push({
          index: i * 9,
          x: (v1_x + v2_x + v3_x) / 3,
          y: (v1_y + v2_y + v3_y) / 3,
          z: (v1_z + v2_z + v3_z) / 3
        });
      }
      // reset color to #ffffff
      for (var k = 0; k < geo.attributes.position.array.length; ++k) {
        geo.attributes.color.array[k] = 1;
      }
      var triangle_net_kd = new util.kd_tree(faces, function(a, b) {
        return Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2) + Math.pow(a.z - b.z, 2);
      }, ['x', 'y', 'z']);
      init_mesh(triangle_net, triangle_net_kd);
      return triangle_net;
    },
    x: 0,
    y: 0,
    z: 0
  };
  var obj_auxiliary_triangle_net = {
    id: 'auxiliary_triangle_net',
    mesh_generator: function () {
      return new THREE.Mesh(
        new THREE.IcosahedronGeometry(NET_SIZE - 1, NET_DIVISION),
        new THREE.MeshBasicMaterial({wireframe: true, color: 0x666666, opacity: 0.4, side: THREE.DoubleSide})
      );
    },
    visible: false,
    x: 0,
    y: 0,
    z: 0
  };

  var obj_auxiliary_sphere_net = {
    id: 'auxiliary_sphere_net',
    mesh_generator: function () {
      return new THREE.Mesh(
        new THREE.SphereGeometry(NET_SIZE - 1, 32, 32),
        new THREE.MeshBasicMaterial({wireframe: true, color: 0x666666, opacity: 0.4, side: THREE.DoubleSide})
      );
    },
    visible: false,
    x: 0,
    y: 0,
    z: 0
  };

  viewer = new Snot({
    dom: $('.viewer-wrap.main')[0],
    container: $('.viewer-container.main')[0],
    size: 1024,
    gyro: true,
    fov: 90,
    max_fov: 110,
    min_fov: 40,
    mouse_sensitivity: 0.3,
    auto_rotation: 0.0,
    rx: 0,
    ry: 0,
    on_touch_move: on_touch_move,
    fisheye_offset: - 30,
    on_touch_start: on_touch_start,
    on_touch_end: on_touch_end,
    raycaster_on_touch_move: false,
    raycaster_on_touch_start: false,
    raycaster_on_touch_end: false,
    sprites: [
      obj_triangle_net,
      obj_auxiliary_triangle_net,
      obj_auxiliary_sphere_net
    ]
  });
  auxiliary.init(obj_auxiliary_triangle_net, obj_auxiliary_sphere_net);
}

function active(data) {
  gui.init(pen);
  pause_flag = false;
  update();
  viewer.start_listeners();
  if (data.filename) {
    storage.load_from_filename(data.filename);
  }
}

function init() {
  init_viewer();
}

function pause() {
  pause_flag = true;
  gui.stop_listeners();
  viewer.stop_listeners();
}

function dispose() {
  gui.stop_listeners();
  viewer.stop_listeners();
  pause_flag = true;
  var page_name = 'editor';
  $('.page[data-page=' + page_name + ']').html('');
}

module.exports = {
  init: init,
  pause: pause,
  active: active,
  dispose: dispose,
};
