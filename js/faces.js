var triangle_net;
var triangle_net_kd;

function init(tri, tri_kd) {
  triangle_net = tri;
  triangle_net_kd = tri_kd;
}

function to_fixed(n) {
  return n.toFixed(2);
}

function set_color_by_index(index, color) {
  var arr = triangle_net.geometry.attributes.color.array;
  for (var i = 0; i < 9; i += 3) {
    arr[index + i] = to_fixed(color.r);
    arr[index + i + 1] = to_fixed(color.g);
    arr[index + i + 2] = to_fixed(color.b);
  }
  triangle_net.geometry.attributes.color.needsUpdate = true;
}

function set_color_by_point(point, pen) {
  var neighbors = triangle_net_kd.nearest(point, pen.size);

  for (var j = 0; j < neighbors.length; ++j) {
    set_color_by_index(neighbors[j][0].index, pen.get_color());
  }
}

module.exports = {
  init: init,
  set_color_by_index: set_color_by_index,
  set_color_by_point: set_color_by_point,
  get_triangle_net: function() {
    return triangle_net;
  },
};
