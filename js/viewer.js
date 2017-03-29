var Snot = require('snot.js');
var request = require('./request.js');
var util = Snot.util;
var THREE = Snot.THREE;
var loading = require('./loading.js');
var config = require('./config.js');
var code_to_color = require('./colors.js').code_to_color;
var white = require('./colors.js').white;
var storage = require('./storage.js');

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
          new THREE.SphereGeometry(config.NET_SIZE - 1, 32, 32),
          new THREE.MeshBasicMaterial({wireframe: true, color: 0x666666, opacity: 0.4, side: THREE.DoubleSide})
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
      size: 1024,
      gyro: false,
      fov: 80,
      max_fov: 110,
      min_fov: 40,
      mouse_sensitivity: 0.3,
      auto_rotation: 0.0,
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

    this.engine.host = this;

    this.auxiliary = new Auxiliary(this.auxiliary_sphere_net_obj);

    var faces_length = this.triangle_net_obj.mesh.geometry.attributes.position.array.length / 9;
    this.faces_colors = new Int8Array(faces_length);

    this.clean(); // set white
  }

  enable_gyro(flag) {
    this.engine.gyro = flag;
  }

  load_from_url(url) {
    loading.show();
    var self = this;
    request.get(url).then(function(res) {
      self.load(storage.unpack(JSON.parse(res).colors));
      loading.hide();
    });
  }

  get_faces_data() {
    return this.faces_colors;
  }

  load(face_data) {
    var code;
    for (var i = 0; i < face_data.length; ++i) {
      code = face_data[i];
      this.set_color_by_index(i, code_to_color[code], code);
    }
  }

  pause() {
    cancelAnimationFrame(this._animate_id);
    this.engine.stop_listeners();
  }

  active() {
    this.update();
    this.engine.start_listeners();
  }

  update() {
    this.engine.update();
    this._animate_id = requestAnimationFrame(() => this.update());
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

}
