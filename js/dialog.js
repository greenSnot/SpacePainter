var template = require('art-template-native');
var $ = require('npm-zepto');

var default_opts = {
  width: 300,
  height: 300,
  content: '',
  title: 'Dialog',
  animate_duration: 0.3, //seconds
};

var wrap;
var dialogs = {};
export function init_dialog() {
  wrap = $('.dialogs');
  wrap.on('click', function(e) {
    dispose_all_dialogs();
  }, false);
}

function dispose_all_dialogs() {
  for (var i in dialogs) {
    dialogs[i].dispose();
  }
}

export class Dialog {
  constructor(opts) {
    for (var k in default_opts) {
      opts[k] = opts[k] || default_opts[k];
    }
    var html = template('template-dialog', opts);
    wrap.append(html);
    this.dom = wrap.find('.dialog:last-child');
    wrap.addClass('visible');

    this.dialog_id = Math.random();
    var self = this;
    dialogs[this.dialog_id] = this;

    for (var i in opts.components) {
      // each events
      for (var j in opts.components[i]) {
        (function(i, j) {
          self.dom.find(i).on(j, function(e) {
            opts.components[i][j](e, self);
          }, false);
        })(i, j);
      }
    }

    this.opts = opts;

    var transition = 'all ' + opts.animate_duration + 's ease-in-out';
    this.dom.css('transition', transition);
    this.dom.css('-webkit-transition', transition);
    this.dom.on('click', function(e) {
      e.stopPropagation();
    }, false);
    setTimeout(() => this.dom.addClass('active'), 30);
  }
  dispose() {
    var self = this;
    function do_dispose() {
      self.dom.remove();
      wrap.removeClass('visible');
      delete(dialogs[self.dialog_id]);
    }
    this.remove_listeners();
    this.dom.removeClass('active');
    setTimeout(do_dispose, this.opts.animate_duration * 1000);
  }
  remove_listeners() {
    for (var i in this.opts.components) {
      // each events
      for (var j in this.opts.components[i]) {
        this.dom.find(i).off(j);
      }
    }
  }
}
