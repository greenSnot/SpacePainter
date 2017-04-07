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

module.exports = {
  get_query_from_url: get_query_from_url,
  url_code_to_json: url_code_to_json,
  json_to_url_code: json_to_url_code,
};
