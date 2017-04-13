var THREE = require('three');

var code_to_color = {};

var colors = [];
/*
 * [
 *  [a, b, c, d], //ROWS
 *  [a, b, c, d], //ROWS
 * ]
 */

var i;
var j;
var k;

var N_H = 9;
var N_S = 3;
var N_L = 4;

var MIN_L = 0.6;
var MAX_L = 0.9;

var MIN_S = 0.4;
var MAX_S = 0.8;

var index = 1;
for (i = 0;i < N_H; ++i) {
  for (j = N_S - 1;j >= 0; --j) {
    colors.push([]);
    for (k = 0;k < N_L; ++k) {
      var color = new THREE.Color().setHSL(
        i / N_H,
        j / (N_S - 1) * (MAX_S - MIN_S) + MIN_S,
        k / (N_L - 1) * (MAX_L - MIN_L) + MIN_L
      );
      color.code = index++;
      colors[colors.length - 1].push(color);
      code_to_color[color.code] = color;
    }
  }
}
// add gray colors
colors.push([]);
for (k = 0;k < N_L; ++k) {
  var color = new THREE.Color().setHSL(
    0,
    0,
    k / (N_L - 1) * 0.7 + 0.1
  );
  color.code = index++;
  colors[colors.length - 1].push(color);
  code_to_color[color.code] = color;
}

var white = new THREE.Color();
white.code = 0;
code_to_color[white.code] = white;

module.exports = {
  code_to_color: code_to_color,
  colors: colors,
  white: white
};
