var template = require('art-template-native');

var loading = require('./loading.js');
var request = require('./request.js');
//var lzw_compress = require('lzwcompress');
var viewer;
var faces_data_stack;
var cur_stack_index;

import { Prompt } from './prompt.js';
import { Notice } from './notice.js';

function init(v) {
  viewer = v;
  cur_stack_index = 0;
  faces_data_stack = [viewer.get_faces_data(true)];
}

function store() {
  var i;
  // sweep up the stack whose index greater than cur_stack_index
  for (i = faces_data_stack.length - 1; i > cur_stack_index; --i) {
    faces_data_stack.splice(i, 1);
  }
  faces_data_stack.push(viewer.get_faces_data(true));
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
  faces_data_stack = [viewer.get_faces_data(true)];
}

function pack(faces_data) {
  var res = [];
  for (var i in faces_data) {
    res.push(faces_data[i]);
  }
  return res;
 // return lzw_compress.pack(faces_data);
}

function unpack(data) {
  return data;
  //return lzw_compress.unpack(data);
}

function do_save(color_data, name) {
  var data = {
    version: 1,
    name: encodeURI(name),
    colors: pack(color_data)
  };
  var base64 = btoa(JSON.stringify(data));
  return request.upload_work(base64, name);
}

function save() {
  var dialog = new Prompt({
    title: '保存',
    placeholder: '请输入作品名,同名作品将会被覆盖',
    confirm_on_click: function(e, value, self) {
      var name = value;
      loading.show();
      do_save(faces_data_stack[cur_stack_index], name).then(function(result) {
        loading.hide();
        new Notice({
          text: '保存成功'
        });
      });
    }
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
  pack: pack,
  unpack: unpack,
};
