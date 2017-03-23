var request = require('./request.js');

var user_basic_info;

function init() {
  return request.get_user_basic_info().then(function(basic_info) {
    user_basic_info = basic_info;
  });
}

function get_user_basic_info() {
  return user_basic_info;
}

module.exports = {
  init: init,
  get_user_basic_info: get_user_basic_info,
};
