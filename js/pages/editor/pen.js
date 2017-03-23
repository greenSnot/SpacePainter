var THREE = require('three');

export class Pen {
  constructor(h, s, l) {
    this.color = new THREE.Color();
    this.size = 1;
    this.set_color_hsl(h, s, l);
    this.random_color_range = 0;
  }
  set_random_color_range(range) {
    this.random_color_range = range;
  }
  set_color_hex(hex) {
    var temp = new THREE.Color().setHex(hex);
    var hsl = temp.getHSL();
    this.set_color_hsl(hsl.h, hsl.s, hsl.l);
  }
  set_color_hsl(h, s, l) {
    this.color.setHSL(h, s, l);
  }
  get_color() {
    var hsl = this.color.getHSL();
    var l = hsl.l + (Math.random() - 0.5) * this.random_color_range;
    l = Math.max(Math.min(1, l), 0);
    var temp = new THREE.Color().setHSL(hsl.h, hsl.s, l);
    return temp;
  }
  set_size(size) {
    this.size = size;
  }
}
