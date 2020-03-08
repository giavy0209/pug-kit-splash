// This is file Unit Test for app.js
import App from '../../../core/brayleinosplash/app';

require('../common');

const { assert } = global;

const fileCSS = [{
  url: 'https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css',
},
{
  url: 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.48.0/codemirror.min.css',
  media: 'screen',
}];

const fileJS = [{
  url: 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.48.0/codemirror.min.js',
  mode: 'defer',
}, {
  url: 'http://bls-frontend.local:3100/accordion.min.js',
}];

describe('app.js Test', () => {
  let app;

  // To test document ready event
  let readyOutput = 'before DOMContentLoaded';
  const readyFunc = () => {
    readyOutput = 'Funtion run when DOMContentLoaded fire';
  };

  // To test window load event
  let loadOutput = 'before Window load';
  const loadFunc = () => {
    loadOutput = 'Funtion run when Window completed load';
  };

  // To test window resize event
  let resizeOutput = 'before Window resize';
  const resizeFunc = () => {
    resizeOutput = 'Funtion run when Window completed resize';
  };

  let resizeOutputViewport = 'before Window resize';
  const resizeFuncViewport = () => {
    resizeOutputViewport = 'Funtion run when Window completed resize and change to orther breakpoint';
  };

  before(() => {
    const dom = new global.jsdom.JSDOM('', { runScripts: 'dangerously' });
    global.window = dom.window;
    global.document = dom.window.document;

    global.eventDOMReady = document.createEvent('Event');
    global.eventDOMReady.initEvent('DOMContentLoaded', true, true);

    global.eventWindowLoad = document.createEvent('Event');
    global.eventWindowLoad.initEvent('load', true, true);

    global.eventWindowResize = document.createEvent('Event');
    global.eventWindowResize.initEvent('resize', true, true);

    app = new App({ name: 'Unit test for app.js', breakpoints: [1200, 992, 768, 576] });

    app.ready(readyFunc);

    app.load(loadFunc);

    app.resize(resizeFuncViewport, resizeFunc);
  });

  describe('constructor', () => {
    it('should set app name as `Unit test for app.js`', () => {
      assert.equal('Unit test for app.js', app.Site.name);
    });

    it('should set app breakpoints as `[576,768,992,1200]`', () => {
      assert.deepEqual([576, 768, 992, 1200], app.Site.breakpoints);
    });
  });

  describe('ready', () => {
    before(() => {
      window.dispatchEvent(global.eventDOMReady);
    });

    it('should return `Funtion run when DOMContentLoaded fire`', () => {
      assert.equal('Funtion run when DOMContentLoaded fire', readyOutput);
    });
  });

  describe('load', () => {
    before(() => {
      window.dispatchEvent(global.eventWindowLoad);
    });

    it('should return `Funtion run when Window completed load`', () => {
      assert.equal('Funtion run when Window completed load', loadOutput);
    });
  });

  describe('resize', () => {
    before(() => {
      global.window.innerWidth = 1200;
      global.window.innerHeight = 768;
      window.dispatchEvent(global.eventWindowResize);
    });

    it('should return `Funtion run when Window completed resize`', () => {
      assert.equal('Funtion run when Window completed resize', resizeOutput);
    });

    it('should return `Funtion run when Window completed resize and change viewport`', () => {
      assert.equal('Funtion run when Window completed resize and change to orther breakpoint', resizeOutputViewport);
    });
  });

  describe('loadCSS', () => {
    before(() => {
      app.loadCSS(fileCSS);
    });

    it('should append 2 files of css', () => {
      assert.equal(2, global.document.querySelectorAll('link[rel="stylesheet"]').length);
    });

    it('should append 1 file of css for media all', () => {
      assert.equal(1, global.document.querySelectorAll('link[media="all"]').length);
    });

    it('should append 1 file of css for media screen', () => {
      assert.equal(1, global.document.querySelectorAll('link[media="screen"]').length);
    });
  });

  describe('loadJS', () => {
    before((done) => {
      app.loadJS(fileJS);
      done();
    });

    it('should append 2 files of javascript', () => {
      assert.equal(2, global.document.querySelectorAll('script').length);
    });

    it('should append 1 file of js for no defer', () => {
      assert.equal(1, global.document.querySelectorAll('script[defer=null]').length);
    });

    it('should append 1 file of js for defer', () => {
      assert.equal(1, global.document.querySelectorAll('script[defer]').length);
    });
  });

  describe('loadFont', () => {
    before(() => {
      app.loadFont();
    });

    it('should append webfont-loader script', () => {
      assert.equal(1, global.document.querySelectorAll('script[src="https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js"]').length);
    });
  });
});
