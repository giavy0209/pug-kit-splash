/**
  * This is the main entry point for a project
* */

// Import main style: webpack will convert into html output as main.min.css when build

import '../../assets/styles/app.scss';
import '../../assets/styles/internal.scss';

import App from '../../../core/brayleinosplash/app';
import BlsDropdown from '../../../core/brayleinosplash/plugins/bls_dropdown/bls_dropdown';
import { convertNodeListToArray } from '../../../core/brayleinosplash/utils';

const setting = {
  name: 'Splash Starter Kit - Demo with UnitTest by MochaJS',
  breakpoints: [768, 992, 1200],
};

window.app = new App(setting);
const html = document.querySelector('html');

app.ready(() => {
  // Define custom code for each project below.
  window.WebFontConfig = {
    custom: {
      families: ['Comfortaa'],
    },
  };
  app.loadFont();

  const menuMain = new BlsDropdown({
    selector: '.hamburger-menu[data-bls-dropdown]',
    events: {
      beforeOpen() {
        if (html.classList.contains('ios')) {
          window.app.iosTopWindow = window.scrollY;
        }
      },
      afterOpen() {
        html.classList.add('menu-opened');
      },
      afterClose() {
        html.classList.remove('menu-opened');
        if (html.classList.contains('ios')) {
          window.scrollTo(0, window.app.iosTopWindow);
        }
      },
    },
  });

  [window.app.menu] = menuMain;

  const btns = convertNodeListToArray(document.querySelectorAll('.sub-navigation .btn'));

  if (btns.length) {
    const _active = btns.filter(x => window.location.href.includes(x.getAttribute('href')));
    if (_active.length)  {
      _active[0].parentElement.classList.add('active');
    }
  }

  if (document.querySelector('#itemTemplatePath') !== null) {
    window.app.templatePath = document.querySelector('#itemTemplatePath').value;
  }

  return app;
});

app.load(() => {
  // console.log('page loaded');
  // Define custom code for each project below.
  function autoFormatCode(editor) {
    const totalLines = editor.lineCount();
    editor.autoFormatRange({ line: 0, ch: 0 }, { line: totalLines });
  }

  function initCodeMirror() {
    // eslint-disable-next-line func-names
    window.CodeMirror.defineExtension('autoFormatRange', function (from, to) {
      const cm = this;
      const outer = cm.getMode();
      const text = cm.getRange(from, to).split('\n');
      const state = window.CodeMirror.copyState(outer, cm.getTokenAt(from).state);
      const tabSize = cm.getOption('tabSize');

      let out = '';
      let lines = 0;
      let atSol = from.ch === 0;

      function newline() {
        out += '\n';
        atSol = true;
        lines += 1;
      }

      for (let i = 0; i < text.length; i += 1) {
        const stream = new window.CodeMirror.StringStream(text[i], tabSize);
        while (!stream.eol()) {
          const inner = window.CodeMirror.innerMode(outer, state);
          const style = outer.token(stream, state); const
            cur = stream.current();
          stream.start = stream.pos;
          if (!atSol || /\S/.test(cur)) {
            out += cur;
            atSol = false;
          }
          if (!atSol && inner.mode.newlineAfterToken
                  && inner.mode.newlineAfterToken(style, cur, stream.string.slice(stream.pos) || text[i + 1] || '', inner.state)) { newline(); }
        }
        if (!stream.pos && outer.blankLine) outer.blankLine(state);
        if (!atSol) newline();
      }

      cm.operation(() => {
        cm.replaceRange(out, from, to);
        for (let cur = from.line + 1, end = from.line + lines; cur <= end; cur += 1) { cm.indentLine(cur, 'smart'); }
      });
    });

    // Applies automatic mode-aware indentation to the specified range
    window.CodeMirror.defineExtension('autoIndentRange', (from, to) => {
      const cmInstance = this;
      this.operation(() => {
        for (let i = from.line; i <= to.line; i += 1) {
          cmInstance.indentLine(i, 'smart');
        }
      });
    });


    Array.prototype.slice.call(document.querySelectorAll('.text-codemirror')).map((x) => {
      const editor = window.CodeMirror.fromTextArea(x, {
        mode: x.dataset.code,
        htmlMode: true,
        matchBrackets: true,
        theme: 'rubyblue',
        indentWithTabs: true,
        lineNumbers: true,
        lineWrapping: true,
        tabMode: 'indent',
        tabSize: 4,
      });
      return autoFormatCode(editor);
    });
  }

  app.loadCSS([{
    url: 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.3.0/codemirror.min.css',
    media: 'screen',
  }]);

  app.loadJS([{
    url: 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.3.0/codemirror.min.js',
    mode: 'defer',
    callback() {
      app.loadJS([{
        url: 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.3.0/mode/xml/xml.min.js',
        mode: 'defer',
        callback() {
          initCodeMirror();
        },
      }]);
    },
  }]);
});

app.resize((oldViewport, currentViewport) => ({ oldViewport, currentViewport }));
