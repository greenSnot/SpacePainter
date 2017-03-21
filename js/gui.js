var THREE = require('three');
var snot = require('../libs/snot.js/build/js/snot_webgl_renderer.min.js');
var util = snot.util;
var fast_click = require('fastclick');
var template = require('./art-template.js');
var $ = require('npm-zepto');
var storage = require('./storage.js');
var page = require('./page.js');
fast_click(document.body);

var pen;
var colors = [
  [0, 0.8],
  [0, 0.6],
  [0, 0.4],
  [0.2, 0.8],
  [0.2, 0.6],
  [0.2, 0.4],
  [0.4, 0.8],
  [0.4, 0.6],
  [0.4, 0.4],
];

var dom_full_palette_wrap;
var dom_main_panel;
var dom_main_palette;
var dom_full_palette;
var dom_btn_trigger;
var dom_btn_save;
var dom_btn_redo;
var dom_btn_undo;
var dom_btn_discovery;
var dom_slider_head;
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

function gen_html_by_color_row_id(r, selected_index) {
  var row = [];
  var c = new THREE.Color();
  for (var i = 0.6; i < 0.9; i+= 0.1) {
    row.push(c.setHSL(colors[r][0], colors[r][1], i).getHex().toString(16));
  }
  row.push(c.setHSL(colors[r][0], colors[r][1], 0.9).getHex().toString(16));
  return template('template-color-row', {
    colors: row,
    row_id: r,
    selected_index: selected_index
  });
}

function update_main_palette(color_row_id, selected_index) {
  dom_main_palette.html(gen_html_by_color_row_id(color_row_id, selected_index));
}

function init_full_palette() {
  for (var r = 0; r < colors.length; ++r) {
    dom_full_palette[0].innerHTML += gen_html_by_color_row_id(r);
  }
}

function btn_color_on_click(e) {
  var color = parseInt(this.getAttribute('data-color'), 16);
  pen.set_color_hex(color);

  var index = $(this).index();
  var row_id = parseInt($(this).closest('.palette-color-row').attr('data-row-id'));
  update_main_palette(row_id, index);
  if ($(this).closest('.main-panel').length === 0) {
    hide_full_palette();
    set_main_panel('palette');
    dom_btn_trigger.removeClass('active');
  } else {
    $('.main-panel .palette-color.selected').removeClass('selected');
    $(this).addClass('selected');
  }
}

function btn_trigger_on_click(e) {
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

function btn_save_on_click() {
  if ($(this).hasClass('active')) {
    storage.save();
  }
}

function btn_discovery_on_click() {
  page.active({
    page: 'discovery'
  });
}

function btn_undo_on_click() {
  if ($(this).hasClass('active')) {
    storage.undo();
  }
}

function btn_redo_on_click() {
  if ($(this).hasClass('active')) {
    storage.redo();
  }
}

function start_listeners() {
  dom_btn_trigger.on('click', btn_trigger_on_click);
  $('body').delegate('.palette-color', 'click', btn_color_on_click);

  dom_slider_head.on('touchmove', slider_head_on_move);

  dom_btn_redo.on('click', btn_redo_on_click);
  dom_btn_undo.on('click', btn_undo_on_click);
  dom_btn_discovery.on('click', btn_discovery_on_click);
  dom_btn_save.on('click', btn_save_on_click);
}

function init_selector() {
  dom_full_palette_wrap = $('.full-palette-wrap');
  dom_main_panel = $('.main-panel');
  dom_main_palette = $('.main-palette');
  dom_full_palette = $('.full-palette');
  dom_btn_trigger = $('.btn-trigger');
  dom_btn_save = $('.btn-save');
  dom_btn_redo = $('.btn-redo');
  dom_btn_undo = $('.btn-undo');
  dom_btn_discovery = $('.btn-discovery');
  dom_slider_head = $('.slider-head');
  dom_slider_bar = $('.slider-bar');
  
  dom_fps = $('.fps');
}


function init(_pen) {
  update_time_arr = [];
  init_selector();
  pen = _pen;

  init_full_palette();
  start_listeners();

  // TODO
  // Do it twice otherwise it won't be work.
  dom_full_palette.find('.palette-color').first().trigger('click');
  dom_full_palette.find('.palette-color').first().trigger('click');
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

  dom_btn_trigger.off('click');
  dom_slider_head.off('touchmove');
  dom_btn_redo.off('click');
  dom_btn_undo.off('click');
  dom_btn_discovery.off('click');
  dom_btn_save.off('click');
}

module.exports = {
  update_fps: update_fps,
  init: init,
  stop_listeners: stop_listeners,
  start_listeners: start_listeners,
};
