var THREE = require('three');
var snot = require('snot.js');
var util = snot.util;
var template = require('art-template-native');
var $ = require('npm-zepto');
var storage = require('../../storage.js');
var router = require('../../router.js');
var colors = require('../../colors.js').colors;

import { Dialog } from '../../dialog.js';

var router_data;

var viewer;
var pen;

var dom_full_palette_wrap;
var dom_main_panel;
var dom_main_palette;
var dom_full_palette;
var dom_btn_expand;
var dom_btn_planet;
var dom_btn_gyro;
var dom_btn_auxiliary;
var dom_btn_save;
var dom_btn_redo;
var dom_btn_back;
var dom_btn_undo;
var dom_btn_fork;
var dom_btn_discovery;
var dom_btn_setting;
var dom_slider_head;
var dom_slider_bar;
var dom_slider_bar;

var dom_fps;
var update_time_arr = [];

function show_full_palette() {
  dom_full_palette_wrap.addClass('active');
}

function hide_full_palette() {
  dom_full_palette_wrap.removeClass('active');
}

function set_main_panel(type) {
  dom_main_panel.attr('data-active-panel', type);
}

function gen_html_by_color_row_id(row_index, selected_col_index) {
  return template('template-color-row', {
    colors: colors[row_index],
    row_id: row_index,
    selected_index: selected_col_index
  });
}

function update_main_palette(color_row_id, selected_index) {
  dom_main_palette.html(gen_html_by_color_row_id(color_row_id, selected_index));
}

function init_full_palette() {
  dom_full_palette[0].innerHTML = '';
  for (var r = 0; r < colors.length; ++r) {
    dom_full_palette[0].innerHTML += gen_html_by_color_row_id(r);
  }
}

function btn_color_on_click(e) {
  var code = parseInt(this.getAttribute('data-color-code'));
  pen.set_color_by_code(code);

  var index = $(this).index();
  var row_id = parseInt($(this).closest('.palette-color-row').attr('data-row-id'));
  update_main_palette(row_id, index);
  if ($(this).closest('.main-panel').length === 0) {
    hide_full_palette();
    set_main_panel('palette');
    dom_btn_expand.removeClass('active');
  } else {
    $('.main-panel .palette-color.selected').removeClass('selected');
    $(this).addClass('selected');
  }
}

function btn_planet_on_click(e) {
  if ($(this).hasClass('active')) {
    $(this).removeClass('active');
    viewer.normal_view();
  } else {
    $(this).addClass('active');
    viewer.planet_view();
  }
}

function btn_expand_on_click(e) {
  if ($(this).hasClass('active')) {
    $(this).removeClass('active');
    hide_full_palette();
    set_main_panel('palette');
  } else {
    $(this).addClass('active');
    show_full_palette();
    set_main_panel('slider');
  }
}

function slider_head_on_move(event) {
  var slider_offset_left = util.left_pos(dom_slider_bar[0]);
  var slider_width = dom_slider_bar.width();
  var scale_division = $('.scales .scale').size();
  var width_per_section = slider_width / (scale_division - 1);

  var x = Math.floor(event.clientX >= 0 ? event.clientX : event.touches[0].pageX);

  var index_to_size = [1, 4, 8, 16];
  var index = Math.floor((x - slider_offset_left + width_per_section / 2) / width_per_section);
  index = Math.max(0, Math.min(index_to_size.length - 1, index));
  pen.set_size(index_to_size[index]);
  dom_slider_head.css('margin-left', width_per_section * index + 'px');
}

function btn_gyro_on_click() {
  if ($(this).hasClass('active')) {
    $(this).removeClass('active');
    viewer.set_gyro_state(false);
  } else {
    $(this).addClass('active');
    viewer.set_gyro_state(true);
  }
}

function btn_auxiliary_on_click() {
  if ($(this).hasClass('active')) {
    $(this).removeClass('active');
    viewer.auxiliary.hide();
  } else {
    $(this).addClass('active');
    viewer.auxiliary.show();
  }
}

function btn_save_on_click() {
  if ($(this).hasClass('active')) {
    storage.save();
    update_edit_gui();
  }
}

function btn_setting_on_click() {
  var settings = {
  };
  new Dialog({
    title: '设置',
    content: template('template-setting-dialog', settings),
    components: {}
  });
}

function btn_discovery_on_click() {
  storage.reset();
  update_edit_gui();
  router.activate({
    page: 'discovery'
  });
}

function btn_fork_on_click() {
  set_mode('edit');
  router.update_url(router_data, true);
}

function btn_undo_on_click() {
  if ($(this).hasClass('active')) {
    storage.undo();
    update_edit_gui();
  }
}

function btn_back_on_click() {
  router.activate({
    page: 'discovery'
  });
}

function btn_redo_on_click() {
  if ($(this).hasClass('active')) {
    storage.redo();
    update_edit_gui();
  }
}

function start_listeners() {
  dom_btn_expand.on('click', btn_expand_on_click);
  dom_btn_planet.on('click', btn_planet_on_click);
  $('body').delegate('.palette-color', 'click', btn_color_on_click);

  dom_slider_head.on('touchmove', slider_head_on_move);

  dom_btn_redo.on('click', btn_redo_on_click);
  dom_btn_undo.on('click', btn_undo_on_click);
  dom_btn_back.on('click', btn_back_on_click);
  dom_btn_fork.on('click', btn_fork_on_click);
  dom_btn_discovery.on('click', btn_discovery_on_click);
  dom_btn_setting.on('click', btn_setting_on_click);
  dom_btn_save.on('click', btn_save_on_click);
  dom_btn_gyro.on('click', btn_gyro_on_click);
  dom_btn_auxiliary.on('click', btn_auxiliary_on_click);
}

function init_selector() {
  dom_full_palette_wrap = $('.full-palette-wrap');
  dom_main_panel = $('.main-panel');
  dom_main_palette = $('.main-palette');
  dom_full_palette = $('.full-palette');
  dom_btn_expand = $('.btn-expand');
  dom_btn_planet = $('.btn-planet');
  dom_btn_save = $('.btn-save');
  dom_btn_gyro = $('.btn-gyro');
  dom_btn_auxiliary = $('.page[data-page=editor] .btn-auxiliary');
  dom_btn_redo = $('.btn-redo');
  dom_btn_undo = $('.btn-undo');
  dom_btn_back = $('.btn-back');
  dom_btn_fork = $('.btn-fork');
  dom_btn_discovery = $('.btn-discovery');
  dom_btn_setting = $('.btn-setting');
  dom_slider_head = $('.slider-head');
  dom_slider_bar = $('.slider-bar');
  dom_fps = $('.fps');
}

function set_mode(mode) {
  router_data.mode = mode;
  $('.editor-mode').css('visibility', 'hidden');
  if (mode === 'preview') {
    viewer.pen.is_down = false;
    $('.editor-mode[data-mode=preview]').css('visibility', 'visible');
  } else if (mode === 'edit') {
    viewer.pen.is_down = true;
    $('.editor-mode[data-mode=edit]').css('visibility', 'visible');
  }
}

function activate(_router_data, v, _pen) {

  viewer = v;
  router_data = _router_data;
  update_time_arr = [];
  init_selector();
  pen = _pen;

  init_full_palette();
  start_listeners();

  dom_full_palette.find('.palette-color')[0].click();

  set_mode(router_data.mode);
  router.update_url(router_data);
}

function update_fps() {
  var now = new Date().valueOf();
  for (var t = 0; t < update_time_arr.length; ++t) {
    if (update_time_arr[t] < now - 1000) {
      update_time_arr.splice(t, 1);
      t--;
    }
  }
  update_time_arr.push(now);
  dom_fps.text(update_time_arr.length);
}

function stop_listeners() {
  $('body').undelegate('.palette-color', 'click', btn_color_on_click);

  dom_btn_expand.off('click');
  dom_btn_planet.off('click');
  dom_slider_head.off('touchmove');
  dom_btn_redo.off('click');
  dom_btn_undo.off('click');
  dom_btn_back.off('click');
  dom_btn_fork.off('click');
  dom_btn_discovery.off('click');
  dom_btn_setting.off('click');
  dom_btn_save.off('click');
  dom_btn_gyro.off('click');
  dom_btn_auxiliary.off('click');
}

function update_edit_gui() {
  var cur_stack_index = storage.get_cur_stack_index();
  var faces_data_stack = storage.get_faces_data_stack();
  if (cur_stack_index > 0) {
    dom_btn_undo.addClass('active');
  } else {
    dom_btn_undo.removeClass('active');
  }
  if (faces_data_stack.length > 1 && faces_data_stack.length - 1 != cur_stack_index) {
    dom_btn_redo.addClass('active');
  } else {
    dom_btn_redo.removeClass('active');
  }
  //TODO diff
  dom_btn_save.addClass('active');
}

function pause() {
  stop_listeners();
  $('.editor-mode').css('visibility', 'hidden');
}

module.exports = {
  update_fps: update_fps,
  activate: activate,
  pause: pause,
  update_edit_gui: update_edit_gui,
  stop_listeners: stop_listeners,
  start_listeners: start_listeners,
};
