var THREE = require('three');
var snot = require('../libs/snot.js/build/js/snot_webgl_renderer.min.js');
var util = snot.util;
var fast_click = require('fastclick');
var template = require('./art-template.js');
var $ = require('npm-zepto');
template.config('openTag', '<#');
template.config('closeTag', '#>');
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

var dom_menu = $('.menu');
var dom_main_panel = $('.main-panel');
var dom_main_palette = $('.main-palette');
var dom_menu_palette = $('.menu-palette');
var dom_btn_trigger = $('.btn-trigger');
var dom_slider_head = $('.slider-head');
var dom_slider_bar = $('.slider-bar');

var dom_fps = $('.fps');
var update_time_arr = [];

function show_menu() {
  dom_menu.addClass('active');
}

function hide_menu() {
  dom_menu.removeClass('active');
}

function set_main_panel(type) {
  dom_main_panel.attr('data-active-panel', type);
}

function gen_html_by_color_row_id(r) {
  var row = [];
  var c = new THREE.Color();
  for (var i = 0.6; i < 0.9; i+= 0.1) {
    row.push(c.setHSL(colors[r][0], colors[r][1], i).getHex().toString(16));
  }
  row.push(c.setHSL(colors[r][0], colors[r][1], 0.9).getHex().toString(16));
  return template('template-color-row', {
    colors: row,
    row_id: r
  });
}

function update_main_palette(color_row_id) {
  dom_main_palette.html(gen_html_by_color_row_id(color_row_id));
}

function init_menu_palette() {
  for (var r = 0; r < colors.length; ++r) {
    dom_menu_palette[0].innerHTML += gen_html_by_color_row_id(r);
  }
}

function btn_color_on_click(e) {
  var color = parseInt(this.getAttribute('data-color'), 16);
  pen.set_color_hex(color);

  if ($(this).closest('.main-panel').length === 0) {
    var row_id = parseInt($(this).closest('.palette-color-row').attr('data-row-id'));
    update_main_palette(row_id);
    hide_menu();
    set_main_panel('palette');
    dom_btn_trigger.removeClass('active');
  }
}

function btn_trigger_on_click(e) {
  if ($(this).hasClass('active')) {
    $(this).removeClass('active');
    hide_menu();
    set_main_panel('palette');
  } else {
    $(this).addClass('active');
    show_menu();
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
  var index = Math.floor((x - slider_offset_left) / width_per_section);
  pen.set_size(index_to_size[index]);
  dom_slider_head.css('margin-left', width_per_section * index + 'px');
}

function init_events() {
  dom_btn_trigger.on('click', btn_trigger_on_click);
  $('body').delegate('.palette-color', 'click', btn_color_on_click);
  dom_menu_palette.find('.palette-color').first().click();
  function preventDefault(e) {
    e.stopPropagation();
    e.preventDefault();
  }
  $('body').on('touchmove', preventDefault);
  $('body').on('touchend', preventDefault);
  $('body').on('touchstart', preventDefault);

  dom_slider_head.on('touchmove', slider_head_on_move);
}

function init(_pen) {
  pen = _pen;

  init_menu_palette();
  init_events();
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

module.exports = {
  update_fps: update_fps,
  init: init,
};
