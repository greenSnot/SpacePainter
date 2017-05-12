var THREE = require('three');
var snot = require('snot.js');
var util = snot.util;
var template = require('art-template-native');
var $ = require('npm-zepto');
var storage = require('../../storage.js');
var router = require('../../router.js');
var colors = require('../../colors.js').colors;
var white = require('../../colors.js').white;
var _ = require('lodash');

import { Dialog } from '../../dialog.js';
import Vue from 'vue';

var router_data;

var viewer;
var pen;

function set_mode(mode) {
  router_data.mode = mode;
  var i;
  if (mode === 'preview') {
    viewer.pen.is_down = false;
  } else if (mode === 'edit') {
    viewer.pen.is_down = true;
    pen.set_color_by_code(colors[0][0].code);
  }
  hide_all_components();
  for (i in components) {
    if (components[i].visible_in_mode[mode]) {
      Vue.set(components[i], 'visible', true);
    }
  }
  Vue.set(components.pen_size_controller, 'visible', false);
}

var components = {};

function update_main_palette(row_id, index) {
  Vue.set(components.main_palette, 'row_colors', colors[row_id]);
  Vue.set(components.main_palette, 'row_id', row_id);
  Vue.set(components.main_palette, 'selected_index', index);
}

function init(v, _pen) {
  colors = _.cloneDeep(colors);
  for (var i in colors) {
    colors[i].push(white);
  }

  viewer = v;
  pen = _pen;

  Vue.component('color-unit', {
    template: '#template-color-unit',
    props: ['selected', 'color', 'border_color', 'color_code'],
    methods: {
      on_click: function(e) {
        var el = e.target;
        pen.set_color_by_code(this.color_code);

        var index = $(el).index();
        var row_id = this.$parent.row_id;
        update_main_palette(row_id, index);
        if ($(el).closest('.main-panel').length === 0) {
          Vue.set(components.btn_expand, 'active', false);
          components.btn_expand.update();
        }
        Vue.set(this.$parent, 'selected_index', index);
      },
    }
  });

  Vue.component('color-row', {
    template: '#template-color-row',
    props: ['row_id', 'row_colors', 'selected_index'],
  });

  components.pen_size_controller = new Vue({
    el: '.pen-size-controller',
    data: {
      visible: false,
      visible_in_mode: {
        preview: false,
        edit: true,
      },
    },
    methods: {
      slider_head_on_move: function(event) {
        var el = event.target;
        var dom_slider_bar = $(el).closest('.slider-bar');
        var slider_offset_left = util.left_pos(dom_slider_bar[0]);
        var slider_width = dom_slider_bar.width();
        var scale_division = dom_slider_bar.find('.scales .scale').size();
        var width_per_section = slider_width / (scale_division - 1);

        var x = Math.floor(event.clientX >= 0 ? event.clientX : event.touches[0].pageX);

        var index_to_size = [1, 8, 32, 64];
        var index = Math.floor((x - slider_offset_left + width_per_section / 2) / width_per_section);
        index = Math.max(0, Math.min(index_to_size.length - 1, index));
        pen.set_size(index_to_size[index]);
        $(el).css('margin-left', width_per_section * index + 'px');
      }
    }
  });

  components.full_palette = new Vue({
    el: '.full-palette',
    data: {
      colors: colors,
      visible: false,
      active: false,
      visible_in_mode: {
        preview: false,
        edit: true,
      },
    },
  });

  components.main_palette = new Vue({
    el: '.main-palette',
    data: {
      row_colors: colors[0],
      row_id: 0,
      selected_index: 0,
      visible: false,
      visible_in_mode: {
        preview: false,
        edit: true,
      },
    },
  });

  components.btn_expand = new Vue({
    el: '.btn-expand',
    data: {
      visible: false,
      active: false,
      visible_in_mode: {
        preview: false,
        edit: true,
      },
    },
    methods: {
      toggle: function() {
        this.active = !this.active;
        this.update();
      },
      update() {
        if (this.active) {
          Vue.set(components.full_palette, 'visible', true);
          Vue.set(components.full_palette, 'active', true);
          Vue.set(components.main_palette, 'visible', false);
          Vue.set(components.pen_size_controller, 'visible', true);
        } else {
          Vue.set(components.full_palette, 'visible', false);
          Vue.set(components.full_palette, 'active', false);
          Vue.set(components.main_palette, 'visible', true);
          Vue.set(components.pen_size_controller, 'visible', false);
        }
      }
    }
  });

  components.btn_planet = new Vue({
    el: '.btn-planet',
    data: {
      active: false,
      visible: false,
      visible_in_mode: {
        preview: true,
        edit: true,
      },
    },
    methods: {
      toggle: function() {
        this.active = !this.active;
        this.update_viewer();
      },
      update_viewer: function() {
        if (this.active) {
          viewer.planet_view();
        } else {
          viewer.normal_view();
        }
      }
    }
  });

  components.btn_back = new Vue({
    el: '.btn-back',
    data: {
      visible: false,
      preview_mode_only: true,
      visible_in_mode: {
        preview: true,
        edit: false,
      },
    },
    methods: {
      on_click: function() {
        router.activate({
          page: 'discovery'
        });
      }
    }
  });

  components.btn_discovery = new Vue({
    el: '.btn-discovery',
    data: {
      visible: false,
      visible_in_mode: {
        preview: false,
        edit: true,
      },
    },
    methods: {
      on_click: function() {
        router.activate({
          page: 'discovery'
        });
      }
    }
  });

  components.btn_undo = new Vue({
    el: '.btn-undo',
    data: {
      active: false,
      visible: false,
      visible_in_mode: {
        preview: false,
        edit: true,
      },
    },
    methods: {
      undo: function() {
        storage.undo();
        update_edit_gui();
      }
    }
  });

  components.btn_redo = new Vue({
    el: '.btn-redo',
    data: {
      active: false,
      visible: false,
      visible_in_mode: {
        preview: false,
        edit: true,
      },
    },
    methods: {
      redo: function() {
        storage.redo();
        update_edit_gui();
      }
    }
  });

  components.btn_save = new Vue({
    el: '.btn-save',
    data: {
      active: false,
      visible: false,
      visible_in_mode: {
        preview: false,
        edit: true,
      },
    },
    methods: {
      save: function() {
        storage.save();
        update_edit_gui();
      }
    }
  });

  components.btn_gyro = new Vue({
    el: '.btn-gyro',
    data: {
      active: false,
      visible: false,
      visible_in_mode: {
        preview: true,
        edit: true,
      },
    },
    methods: {
      toggle: function() {
        this.active = !this.active;
        this.update();
      },
      update: function() {
        if (this.active) {
          viewer.set_gyro_state(true);
        } else {
          viewer.set_gyro_state(false);
        }
      }
    }
  });

  components.btn_auxiliary = new Vue({
    el: '.page[data-page=editor] .btn-auxiliary',
    data: {
      active: false,
      visible: false,
      visible_in_mode: {
        preview: true,
        edit: true,
      },
    },
    methods: {
      toggle: function() {
        this.active = !this.active;
        this.update();
      },
      update: function() {
        if (this.active) {
          viewer.auxiliary.show();
        } else {
          viewer.auxiliary.hide();
        }
      }
    }
  });

  components.btn_fork = new Vue({
    el: '.btn-fork',
    data: {
      visible: false,
      visible_in_mode: {
        preview: true,
        edit: false,
      },
    },
    methods: {
      fork: function() {
        set_mode('edit');
        router.update_url(router_data, true);
      },
    }
  });
}

function activate(_router_data) {
  router_data = _router_data;

  set_mode(router_data.mode);
  router.update_url(router_data);
}

function update_edit_gui() {
  var cur_stack_index = storage.get_cur_stack_index();
  var faces_data_stack = storage.get_faces_data_stack();

  Vue.set(components.btn_undo, 'active', cur_stack_index > 0);
  Vue.set(components.btn_redo, 'active', faces_data_stack.length > 1 && faces_data_stack.length - 1 != cur_stack_index);
  //TODO diff
  Vue.set(components.btn_save, 'active', true);
}

function hide_all_components() {
  for (var i in components) {
    Vue.set(components[i], 'visible', false);
  }
}

function pause() {
}

module.exports = {
  init: init,
  activate: activate,
  pause: pause,
  update_edit_gui: update_edit_gui,
};
