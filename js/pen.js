var THREE = require('three');
var code_to_color = require('./colors.js').code_to_color;
var white = require('./colors.js').white;

export class Pen {
  constructor(color_code) {
    this.color = new THREE.Color();
    this.size = 1;
    this.is_down = false;
    this.color_code = color_code || 0 ;
    this.set_color_by_code(this.color_code);
    this.random_color_range = 0.1;
  }
  set_random_color_range(range) {
    this.random_color_range = range;
  }
  set_color_by_code(code) {
    this.color_code = code;
    this.color.copy(code_to_color[code]);
  }
  get_color() {
    if (this.color_code === white.code) {
      return new THREE.Color();
    }
    var hsl = this.color.getHSL();
    var l = hsl.l + (Math.random() - 0.5) * this.random_color_range;
    l = Math.max(Math.min(1, l), 0);
    var temp = new THREE.Color().setHSL(hsl.h, hsl.s, l);
    return temp;
  }
  set_size(size) {
    this.size = size;
  }
  set_state(pen_down) {
    this.is_down = pen_down;
  }
}
