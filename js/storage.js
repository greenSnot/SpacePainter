var template = require('art-template-native');

var loading = require('./loading.js');
var request = require('./request.js');
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
  var counter = 0;
  var i = 0;
  var cur_color_code = faces_data[0];
  var res = [];
  while (i < faces_data.length) {
    if (cur_color_code != faces_data[i]) {
      res.push(cur_color_code);
      res.push(counter);
      counter = 0;
      cur_color_code = faces_data[i];
    }
    ++counter;
    ++i;
  }
  res.push(cur_color_code);
  res.push(counter);
  return res;
}

function unpack(data) {
  var res = [];
  var n;
  var value;
  for (var i = 0;i < data.length; i += 2) {
    n = data[i + 1];
    value = data[i];
    for (var j = 0;j < n; ++j) {
      res.push(value);
    }
  }
  return res;
}

function save() {
  function do_save(name) {
    var data = {
      version: 1,
      colors: pack(faces_data_stack[cur_stack_index])
    };
    var base64 = btoa(JSON.stringify(data));
    loading.show();
    request.upload_work(base64, name).then(function(result) {
      loading.hide();
      new Notice({
        text: '保存成功'
      });
    });
  }

  new Prompt({
    title: '保存',
    placeholder: '请输入作品名',
    confirm_on_click: function(e, value, self) {
      var name = value;
      do_save(name);
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
