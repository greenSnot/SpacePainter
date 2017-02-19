var THREE = require('three');
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
var dom_tab_palette = $('.tab-content[data-type=palette]');
var dom_btn_trigger = $('.btn-trigger');

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

function init(_pen) {
  pen = _pen;
  function init_tab_palette() {
    for (var r = 0; r < colors.length; ++r) {
      dom_tab_palette[0].innerHTML += gen_html_by_color_row_id(r);
    }
  }

  init_tab_palette();
  dom_btn_trigger.on('click', function(e) {
    if ($(this).hasClass('active')) {
      $(this).removeClass('active');
      hide_menu();
    } else {
      $(this).addClass('active');
      show_menu();
    }
  });

  function btn_color_on_click(e) {
    var color = parseInt(this.getAttribute('data-color'), 16);
    pen.set_color_hex(color);

    if ($(this).closest('.main-panel').length === 0) {
      var row_id = parseInt($(this).closest('.palette-color-row').attr('data-row-id'));
      update_main_palette(row_id);
    }
  }
  $('body').delegate('.palette-color', 'click', btn_color_on_click);
  dom_tab_palette.find('.palette-color').first().click();
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
