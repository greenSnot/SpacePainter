var snot_util = require('snot.js').util;

function json_to_url_code(j) {
  var u = [];
  for (var i in j) {
    u.push(i + '=' + j[i]);
  }
  return u.join('&');
}

function url_code_to_json(u) {
  var query = {};
  if (u) {
    var data = u.split('&');
    for (var i in data) {
      var item = data[i].split('=');
      query[item[0]] = item[1];
    }
  }
  return query;
}

function get_query_from_url(url) {
  url = url || location.href;
  var path_appendix = url.split('?')[1];
  var query = url_code_to_json(path_appendix);
  return query;
}

function resize_image(img, dest_width) {
  var canvas = document.createElement('canvas'),
  ctx = canvas.getContext('2d'),
  oc = document.createElement('canvas'),
  octx = oc.getContext('2d');

  canvas.width = dest_width; // destination canvas size
  canvas.height = canvas.width * img.height / img.width;

  var cur = {
    width: Math.floor(img.width * 0.5),
    height: Math.floor(img.height * 0.5)
  };

  oc.width = cur.width;
  oc.height = cur.height;

  octx.drawImage(img, 0, 0, cur.width, cur.height);

  while (cur.width * 0.5 > dest_width) {
    cur = {
      width: Math.floor(cur.width * 0.5),
      height: Math.floor(cur.height * 0.5)
    };
    octx.drawImage(oc, 0, 0, cur.width * 2, cur.height * 2, 0, 0, cur.width, cur.height);
  }

  ctx.drawImage(oc, 0, 0, cur.width, cur.height, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function to_fixed(n, len) {
  return n.toFixed(len || 2);
}

function sky_box_to_sky_ball(full_canvas, ball_w) {
  var w = full_canvas.width;
  var full_canvas_ctx = full_canvas.getContext('2d');

  var sky_ball = document.createElement('canvas');
  var sky_ball_ctx = sky_ball.getContext('2d');
  sky_ball.width = ball_w;
  sky_ball.height = ball_w / 2;

  var index_to_rotation = [
    function(x, y) { // right
      x = w - x;
      return snot_util.position_to_rotation(w / 2, x - w / 2, y - w / 2);
    },
    function(x, y) { // front
      return snot_util.position_to_rotation(x - w / 2, w / 2, y - w / 2);
    },
    function(x, y) { // left
      return snot_util.position_to_rotation(- w / 2, x - w / 2, y - w / 2);
    },
    function(x, y) { // back
      x = w - x;
      return snot_util.position_to_rotation(x - w / 2, - w / 2, y - w / 2);
    },
    function(x, y) { // up
      y = w - y;
      return snot_util.position_to_rotation(x - w / 2, y - w / 2, w / 2);
    },
    function(x, y) { // down
      return snot_util.position_to_rotation(x - w / 2, y - w / 2, -w / 2);
    },
  ];
  for (var i = 0;i < 6; ++i) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = w;
    canvas.height = w;
    var data = full_canvas_ctx.getImageData(0, i * w, w, (i + 1) * w);
    ctx.putImageData(data, 0, 0);

    for (var x = 0;x < w; ++x) {
      for (var y = 0;y < w; ++y) {
        var rotation = index_to_rotation[i](w - x, w - y);
        var offset_ry = 90;
        var ball_x = Math.floor((rotation.ry + offset_ry > 360 ? rotation.ry - 360 + offset_ry : rotation.ry + offset_ry) / 360 * ball_w);
        var ball_y = Math.floor((rotation.rx + 90) / 180 * ball_w / 2);

        var index = (x + y * w) * 4;
        sky_ball_ctx.fillStyle = 'rgba('+data.data[index]+','+data.data[index+1]+','+data.data[index+2]+','+1+')';
        sky_ball_ctx.fillRect(ball_x, ball_y, 1, 1);
      }
    }
  }
  return sky_ball;
}

module.exports = {
  sky_box_to_sky_ball: sky_box_to_sky_ball,
  to_fixed: to_fixed,
  resize_image: resize_image,
  get_query_from_url: get_query_from_url,
  url_code_to_json: url_code_to_json,
  json_to_url_code: json_to_url_code,
};
