var template = require('art-template-native');
var $ = require('npm-zepto');

export class Notice {
  constructor(opts) {
    var html = template('template-notice', opts);
    var wrap = $('.notices');
    wrap.append(html);
    this.dom = wrap.find('.notice:last-child');
    setTimeout(() => this.dispose(), opts.duraiton || 2000);
  }
  dispose() {
    this.dom.remove();
  }
}
