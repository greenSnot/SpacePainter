var template = require('art-template-native');
import { Dialog } from './dialog.js';

var default_opts = {
  title: 'Error',
  content: 'content',
  buttons: [
    {
      text: '确定',
      style: 'primary',
      on_click: function(e, self) {
        self.dispose();
      }
    }
  ],
  components: {}
};

export class Confirm extends Dialog {
  constructor(opts) {
    for (var k in default_opts) {
      opts[k] = opts[k] || default_opts[k];
    }
    opts.content = '<div class="confirm-content flex1">' + opts.content + '</div>';
    for (var i in opts.buttons) {
      opts.buttons[i].id = 'button' + Math.floor(Math.random() * 9999999);
      opts.components['#' + opts.buttons[i].id] = {
        click: opts.buttons[i].on_click,
      };
    }
    opts.content += template('template-confirm-buttons', opts);
    super(opts);
  }
}
