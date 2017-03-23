var $ = require('npm-zepto');
var THREE = require('three');
var set_color_by_index = require('./mesh.js').set_color_by_index;
var get_triangle_net = require('./mesh.js').get_triangle_net;
var lzw_compress = require('lzwcompress');
var request = require('../../request.js');
var config = require('../../config.js');
var loading = require('../../loading.js');

var face_color_stack = [];
var cur_stack_index = -1;

var dom_btn_save;
var dom_btn_redo;
var dom_btn_undo;

function init() {
  dom_btn_save = $('.btn-save');
  dom_btn_redo = $('.btn-redo');
  dom_btn_undo = $('.btn-undo');
}

function update_gui() {
  if (cur_stack_index >= 0) {
    dom_btn_undo.addClass('active');
  } else {
    dom_btn_undo.removeClass('active');
  }
  if (face_color_stack.length > 0 && face_color_stack.length - 1 != cur_stack_index) {
    dom_btn_redo.addClass('active');
  } else {
    dom_btn_redo.removeClass('active');
  }
  if (face_color_stack.length > 0) {
    dom_btn_save.addClass('active');
  } else {
    dom_btn_save.removeClass('active');
  }
}

function store() {
  var i;
  // sweep up the stack whose index greater than cur_stack_index
  for (i = face_color_stack.length - 1; i > cur_stack_index; --i) {
    face_color_stack.splice(i, 1);
  }

  var arr = get_triangle_net().geometry.attributes.color.array;
  var face_color = [];
  for (i = 0; i < arr.length; i += 9) {
    face_color.push([
      arr[i], //r
      arr[i + 1], //g
      arr[i + 2] //b
    ]);
  }
  face_color_stack.push(face_color);

  cur_stack_index = face_color_stack.length - 1;
  update_gui();
}

function undo() {
  --cur_stack_index;
  if (cur_stack_index == -1) {
    clean();
  } else {
    update_faces_by_stack_index(cur_stack_index);
  }
  update_gui();
}

function redo() {
  ++cur_stack_index;
  update_faces_by_stack_index(cur_stack_index);
  update_gui();
}

function clean() {
  var color = new THREE.Color();
  var n_faces = get_triangle_net().geometry.attributes.color.array.length / 9;
  for (var i = 0; i < n_faces; ++i) {
    color.setRGB(1, 1, 1);
    set_color_by_index(i * 9, color);
  }
}

function reset() {
  clean();
  cur_stack_index = -1;
  face_color_stack = [];
  update_gui();
}

function update_faces_by_stack_index(index) {
  var face_color = face_color_stack[index];
  var color = new THREE.Color();
  for (var i = 0; i < face_color.length; ++i) {
    color.setRGB(face_color[i][0], face_color[i][1], face_color[i][2]);
    set_color_by_index(i * 9, color);
  }
}

function save() {
  //TODO
  var name = 'test'+ Math.random();
  var compressed = lzw_compress.pack(face_color_stack[cur_stack_index]);
  var base64 = btoa(JSON.stringify(compressed));
  loading.show();
  request.upload_work(base64, name).then(function(result) {
    loading.hide();
    //TODO
    //alert('success');
  });
}

function load_from_filename(filename) {
  var url = config.cdn_works_path + filename;
  loading.show();
  request.get(url).then(function(res) {
    var data = lzw_compress.unpack(JSON.parse(res));
    face_color_stack.push(data);
    cur_stack_index = face_color_stack.length - 1;
    update_faces_by_stack_index(cur_stack_index);
    loading.hide();
  });
}

module.exports = {
  store: store,
  clean: clean,
  reset: reset,
  undo: undo,
  redo: redo,
  save: save,
  init: init,
  load_from_filename: load_from_filename,
};
