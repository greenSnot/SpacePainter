var template = require('art-template-native');
import { Confirm } from './confirm.js';

var default_opts = {
  title: '',
  placeholder: '',
  cancel_on_click: function(e, value, self) {
    self.dispose();
  },
  confirm_on_click: function(e, value, self) {
    self.dispose();
  }
};

export class Prompt extends Confirm {
  constructor(opts) {
    for (var k in default_opts) {
      opts[k] = opts[k] || default_opts[k];
    }
    opts.content = template('template-prompt-input', opts);
    opts.buttons = [
      {
        text: '取消',
        style: '',
        on_click: function(e, self) {
          var value = $('.prompt-input').val();
          opts.cancel_on_click(e, value, self);
        }
      },
      {
        text: '确定',
        style: 'primary',
        on_click: function(e, self) {
          var value = $('.prompt-input').val();
          opts.confirm_on_click(e, value, self);
        }
      }
    ];
    opts.components = {
      '.prompt-input': {
        'input': function(e, self) {
          if (e.keyCode == 13) {
            var value = $('.prompt-input').val();
            self.opts.confirm_on_click(e, value, self);
          }
        }
      }
    };
    super(opts);
  }
}
