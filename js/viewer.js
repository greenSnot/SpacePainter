var Snot = require('snot.js');
var request = require('./request.js');
var util = Snot.util;
var THREE = Snot.THREE;
var loading = require('./loading.js');
var config = require('./config.js');
var code_to_color = require('./colors.js').code_to_color;
var white = require('./colors.js').white;
var storage = require('./storage.js');
var easing = require('easing-js-ii');

import { Auxiliary } from './auxiliary.js';

var triangle_net_kd;
function init_kd_tree(geo) {
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
      index: i,
      x: (v1_x + v2_x + v3_x) / 3,
      y: (v1_y + v2_y + v3_y) / 3,
      z: (v1_z + v2_z + v3_z) / 3
    });
  }

  triangle_net_kd = new util.kd_tree(faces, function(a, b) {
    return Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2) + Math.pow(a.z - b.z, 2);
  }, ['x', 'y', 'z']);
}

var size = 1024;
//var screenshot_renderer = new THREE.WebGLRenderer();

export class Viewer {

  constructor(opts) {

    this.pen = opts.pen;

    var self = this;

    this.triangle_net_obj = {
      id: 'triangle_net',
      ignore_raycaster: true,
      mesh_generator: function () {
        var geo = new THREE.IcosahedronBufferGeometry(config.NET_SIZE, config.NET_DIVISION);
        var triangle_net = new THREE.Mesh(
          geo,
          new THREE.MeshBasicMaterial({color: 0xffffff, vertexColors: THREE.VertexColors, side: THREE.DoubleSide})
        );

        geo.addAttribute('color', new THREE.BufferAttribute(new Float32Array(geo.attributes.position.array.length), 3 ));
        if (!triangle_net_kd) {
          init_kd_tree(geo);
        }
        self.triangle_net_kd = triangle_net_kd;

        return triangle_net;
      },
      x: 0,
      y: 0,
      z: 0
    };

    this.auxiliary_sphere_net_obj = {
      id: 'auxiliary_sphere_net',
      ignore_raycaster: true,
      mesh_generator: function () {
        return new THREE.Mesh(
          new THREE.SphereGeometry(config.NET_SIZE - 1, 36, 36),
          new THREE.MeshBasicMaterial({wireframe: true, transparent: true, color: 0x666666, opacity: 0.2, side: THREE.DoubleSide})
        );
      },
      visible: false,
      x: 0,
      y: 0,
      z: 0
    };

    this.engine = new Snot({
      dom: opts.dom,
      container: opts.container,
      size: size,
      gyro: false,
      fov: 80,
      max_fov: 110,
      min_fov: 40,
      mouse_sensitivity: 0.3,
      auto_rotation: opts.auto_rotation || 0.0,
      rx: 0,
      ry: 0,
      fisheye_offset: - 30,
      controls_on_click: opts.controls_on_click,
      on_click: opts.on_click || function() {},
      on_touch_move: opts.on_touch_move || function() {},
      on_touch_start: opts.on_touch_start || function() {},
      on_touch_end: opts.on_touch_end || function() {},
      raycaster_on_touch_move: false,
      raycaster_on_touch_start: false,
      raycaster_on_touch_end: false,
    });

    this.engine.add_sprites([
      this.triangle_net_obj,
      this.auxiliary_sphere_net_obj
    ]);

    this.engine.controls.multi_fingers_handler = function(e, x, y) {
      var cfx = event.touches[0].pageX;// Current frist  finger x
      var cfy = event.touches[0].pageY;// Current first  finger y
      var csx = x;                     // Current second finger x
      var csy = y;                     // Current second finger y
      var avg_x = (cfx + csx) * 0.5;
      var avg_y = (cfy + csy) * 0.5;

      var last_avg_x = (this.touches.fx + this.touches.sx) * 0.5;
      var last_avg_y = (this.touches.fy + this.touches.sy) * 0.5;

      this.host.set_ry(this.host.dest_ry + (last_avg_x - avg_x) * this.host.mouse_sensitivity);
      this.host.set_rx(this.host.dest_rx - (last_avg_y - avg_y) * this.host.mouse_sensitivity);

      var dis = util.distance2D(this.touches.fx, this.touches.fy, this.touches.sx, this.touches.sy) - util.distance2D(cfx, cfy, csx, csy);

      var ratio = 0.12;
      this.host.set_fov(this.host.fov + dis * ratio);

      this.touches.fx = cfx;
      this.touches.fy = cfy;
      this.touches.sx = csx;
      this.touches.sy = csy;
    };

    this.engine.host = this;

    this.auxiliary = new Auxiliary(this.auxiliary_sphere_net_obj);

    this.faces_length = this.triangle_net_obj.mesh.geometry.attributes.position.array.length / 9;
    this.faces_colors = new Int8Array(this.faces_length);

    this.clean(); // set white
  }

  set_gyro_state(flag) {
    this.engine.gyro = flag;
  }

  load_from_url(url) {
    loading.show();
    var self = this;
    return request.get(url).then(function(res) {
      self.load(storage.unpack(JSON.parse(res).colors));
      loading.hide();
    });
  }

  get_faces_data(need_clone) {
    if (!need_clone) {
      return this.faces_colors;
    }
    var clone = new Int8Array(this.faces_length);
    for (var i in this.faces_colors) {
      clone[i] = this.faces_colors[i];
    }
    return clone;
  }

  load(face_data) {
    var code;
    var cur_color_code = this.pen.color_code;
    for (var i = 0; i < face_data.length; ++i) {
      code = face_data[i];
      if (code != this.faces_colors[i]) {
        this.pen.set_color_by_code(code);
        this.set_color_by_index(i, this.pen.get_color(), code);
      }
    }
    this.pen.set_color_by_code(cur_color_code);
  }

  pause() {
    cancelAnimationFrame(this._animate_id);
    this.engine.stop_listeners();
  }

  activate() {
    this.update();
    this.engine.start_listeners();
  }

  set_color_by_index(index, color, color_code) {
    var arr = this.triangle_net_obj.mesh.geometry.attributes.color.array;
    function to_fixed(n) {
      return n.toFixed(2);
    }

    for (var i = 0; i < 9; i += 3) {
      arr[index * 9 + i] = to_fixed(color.r);
      arr[index * 9 + i + 1] = to_fixed(color.g);
      arr[index * 9 + i + 2] = to_fixed(color.b);
    }

    this.faces_colors[index] = color_code;
    this.triangle_net_obj.mesh.geometry.attributes.color.needsUpdate = true;
  }

  set_color_by_point(point, pen) {
    var neighbors = this.triangle_net_kd.nearest(point, pen.size);

    for (var j = 0; j < neighbors.length; ++j) {
      this.set_color_by_index(neighbors[j][0].index, pen.get_color(), pen.color_code);
    }
  }

  clean() {
    var n_faces = this.triangle_net_obj.mesh.geometry.attributes.color.array.length / 9;
    for (var i = 0; i < n_faces; ++i) {
      this.set_color_by_index(i, white, white.code);
    }
  }

  update() {
    if (this.planet_view_should_update) {
      this.planet_view_update();
    }
    this.engine.update();
    this._animate_id = requestAnimationFrame(() => this.update());
  }

  planet_view(duration) {
    duration = duration || 1000;
    this.engine.lock_rx = true;
    this.engine.max_fov = 150;
    this.planet_view_progress_step = 1 / 60 / (duration / 1000);
    this.planet_view_progress = 0;
    this.planet_view_start_offset = this.engine.camera_offset_y;
    this.planet_view_start_rx = this.engine.rx;
    this.planet_view_start_fov = this.engine.fov;
    this.planet_view_end_fov = 150;
    this.planet_view_end_rx = -90;
    this.planet_view_end_offset = (config.NET_SIZE / 2);
    this.planet_view_should_update = true;
    this.engine.smooth = 0;
  }

  planet_view_update() {
    this.planet_view_progress += this.planet_view_progress_step;
    var progress = easing.easeOutCubic(this.planet_view_progress);
    this.engine.camera_offset_y = (this.planet_view_end_offset - this.planet_view_start_offset) * progress + this.planet_view_start_offset;
    this.engine.fov = (this.planet_view_end_fov - this.planet_view_start_fov) * progress + this.planet_view_start_fov;
    this.engine.dest_rx = (this.planet_view_end_rx - this.planet_view_start_rx) * progress + this.planet_view_start_rx;
    if (this.planet_view_progress + this.planet_view_progress_step >= 1) {
      this.planet_view_should_update = false;
    }
  }

  normal_view(duration) {
    duration = duration || 1000;
    this.engine.lock_rx = false;
    this.planet_view_progress_step = 1 / 60 / (duration / 1000);
    this.planet_view_progress = 0;
    this.planet_view_start_offset = this.engine.camera_offset_y;
    this.planet_view_start_rx = this.engine.rx;
    this.planet_view_start_fov = this.engine.fov;
    this.planet_view_end_offset = 0;
    this.planet_view_end_fov = 90;
    this.planet_view_end_rx = 0;
    this.planet_view_should_update = true;
  }

  //screenshot() {
  //  screenshot_renderer.setSize(400, 400);
  //  return this.engine.screenshot_planet_view(screenshot_renderer, 150, config.NET_SIZE);
  //}
}
