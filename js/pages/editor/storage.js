var lzw_compress = require('lzwcompress');
var loading = require('../../loading.js');
var request = require('../../request.js');
var viewer;
var faces_data_stack;
var cur_stack_index;

function init(v) {
  viewer = v;
  cur_stack_index = 0;
  faces_data_stack = [viewer.get_faces_data()];
}

function store() {
  var i;
  // sweep up the stack whose index greater than cur_stack_index
  for (i = faces_data_stack.length - 1; i > cur_stack_index; --i) {
    faces_data_stack.splice(i, 1);
  }
  faces_data_stack.push(viewer.get_faces_data());
  cur_stack_index = faces_data_stack.length - 1;
}

function undo() {
  --cur_stack_index;
  viewer.load(faces_data_stack[cur_stack_index]);
}

function redo() {
  ++cur_stack_index;
  viewer.load(faces_data_stack[cur_stack_index]);
}

function reset() {
  viewer.clean();
  cur_stack_index = 0;
  faces_data_stack = [viewer.get_faces_data()];
}

function save() {
  //TODO
  var name = 'test' + Math.random();
  var compressed = lzw_compress.pack(faces_data_stack[cur_stack_index]);
  var base64 = btoa(JSON.stringify(compressed));
  loading.show();
  request.upload_work(base64, name).then(function(result) {
    loading.hide();
    //TODO
  });
}

function get_faces_data_stack() {
  return faces_data_stack;
}

function get_cur_stack_index() {
  return cur_stack_index;
}

module.exports = {
  init: init,
  get_faces_data_stack: get_faces_data_stack,
  get_cur_stack_index: get_cur_stack_index,
  store: store,
  save: save,
  redo: redo,
  undo: undo,
  reset: reset,
};
