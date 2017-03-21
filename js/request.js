var $ = require('npm-zepto');

var post = function(url, data) {
  return new Promise(function(resolve, reject) {
    $.ajax({
      url: url,
      type: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json',
      dataType: 'json',
      xhrFields: {
        withCredentials: true
      },
      timeout: 8000,
      success: resolve,
      error: reject
    });
  });
};

module.exports = {
  post: post,
};
