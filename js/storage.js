var $ = require('npm-zepto');
var THREE = require('three');
var set_color_by_index = require('./faces.js').set_color_by_index;
var get_triangle_net = require('./faces.js').get_triangle_net;

var face_color_stack = [];
var cur_stack_index = -1;

var dom_btn_save = $('.btn-save');
var dom_btn_redo = $('.btn-redo');
var dom_btn_undo = $('.btn-undo');

function update_undo_redo_btn() {
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
  //TODO
  dom_btn_save.addClass('active');
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
  update_undo_redo_btn();
}

function undo() {
  --cur_stack_index;
  if (cur_stack_index == -1) {
    reset();
  } else {
    update_faces_by_stack_index(cur_stack_index);
  }
  update_undo_redo_btn();
}

function redo() {
  ++cur_stack_index;
  update_faces_by_stack_index(cur_stack_index);
  update_undo_redo_btn();
}

function reset() {
  var color = new THREE.Color();
  for (var i = 0; i < face_color_stack[0].length; ++i) {
    color.setRGB(1, 1, 1);
    set_color_by_index(i * 9, color);
  }
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
  var name = prompt('work name');

}

module.exports = {
  store: store,
  undo: undo,
  redo: redo,
  save: save,
};
