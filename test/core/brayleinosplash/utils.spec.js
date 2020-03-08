// This is file Unit Test for app.js
import {
  setCookie,
  checkCookie,
  getCookie,
  setLocalData,
  getLocalData,
  getUrlQueryString,
  convertNodeListToArray,
  wrap,
  unWrap,
  getScrollbarWidth,
  prepend,
  insertAfter,
  ajaxRequest,
  loadTemplate,
  debounce,
  scrollToTop,
  scrollToElement,
  fireEvent,
  processTemplate,
  getAllDatesInMonth,
  isToday,
} from '../../../core/brayleinosplash/utils';

const sinon = require('sinon');
require('../common');

const _template = '<div>this is template {{title}}</div>';

describe('utils.js Test', () => {
  before((done) => {
    const dom = new global.jsdom.JSDOM('<html><body><div id="message">Hello world!</div><div id="warning">Hello warning!</div></body></html>', {
      url: 'http://localhost:3000',
      pretendToBeVisual: true,
    });
    global.window = dom.window;
    global.document = dom.window.document;
    Object.defineProperties(global.window.HTMLElement.prototype, {
      offsetLeft: {
        get() { return parseFloat(global.window.getComputedStyle(this).marginLeft) || 0; },
      },
      offsetTop: {
        get() { return parseFloat(global.window.getComputedStyle(this).marginTop) || 0; },
      },
      offsetHeight: {
        get() { return parseFloat(global.window.getComputedStyle(this).height) || 0; },
      },
      offsetWidth: {
        get() { return parseFloat(global.window.getComputedStyle(this).width) || 0; },
      },
    });
    done();
  });

  describe('Cookies', () => {
    before(() => {
      setCookie('test', '1', 1);
    });

    it('should setup a cookie with name test', () => expect(checkCookie('test')).to.be.true);
    it('cookie with name test should has value = 1', () => expect(getCookie('test')).to.equal('1'));
  });

  describe('Local Storage', () => {
    it('should setup localStorage have 1 item with key=test and value=1', () => {
      setLocalData('test', 1);
      expect(getLocalData('test')).to.equal('1');
    });
  });

  describe('getUrlQueryString', () => {
    const encodeParams = encodeURIComponent(' !"#$%&\'()*+,-./0123456789:;<=>?@');
    const url = `abc.com?param1=param1Value&param2=param2Value&paramEncode=${encodeParams}`;

    it('should return `param1Value`', () => {
      assert.equal('param1Value', getUrlQueryString('param1', url));
    });

    it('should return `param2Value`', () => {
      assert.equal('param2Value', getUrlQueryString('param2', url));
    });

    it('should return special characters ` !"#$%&\'()*+,-./0123456789:;<=>?@`', () => {
      assert.equal(' !"#$%&\'()*+,-./0123456789:;<=>?@', getUrlQueryString('paramEncode', url));
    });
  });

  describe('convertNodeListToArray', () => {
    it('should return array', () => {
      expect(convertNodeListToArray(global.document.querySelectorAll('div'))).to.be.an('array');
    });
  });

  describe('wrap', () => {
    before((done) => {
      const wrapper = global.document.createElement('section');
      wrap(wrapper, global.document.querySelector('#message'));
      done();
    });

    it('div with id="message" should wrapped by section', () => {
      expect(global.document.querySelector('#message').parentElement.nodeName).to.equal('SECTION');
    });
  });

  describe('unwrap', () => {
    before((done) => {
      const wrapper = global.document.querySelector('#message').parentElement;
      unWrap(wrapper);
      done();
    });

    it('div with id="message" have parent is body tag', () => {
      expect(global.document.querySelector('#message').parentElement.nodeName).to.equal('BODY');
    });
  });

  describe('getScrollbarWidth', () => {
    it('should always equal 0', () => {
      expect(getScrollbarWidth()).to.equal(0);
    });
  });

  describe('prepend', () => {
    before((done) => {
      const source = global.document.createElement('p');
      prepend(global.document.querySelector('#message'), source);
      done();
    });

    it('div with id="message" should have firstElementChild is p', () => {
      expect(global.document.querySelector('#message').firstElementChild.nodeName).to.equal('P');
    });
  });

  describe('insertAfter', () => {
    before((done) => {
      const source = global.document.createElement('div');
      insertAfter(global.document.querySelector('#message').firstElementChild, source);
      done();
    });

    it('div with id="message" should have em tag after first element', () => {
      expect(global.document.querySelector('#message').firstElementChild.nextElementSibling.nodeName).to.equal('DIV');
    });
  });

  describe('ajaxRequest', () => {
    let xhr;
    let requests;

    before((done) => {
      xhr = sinon.useFakeXMLHttpRequest();
      requests = [];
      xhr.onCreate = (req) => { requests.push(req); };

      done();
    });

    it('should make 1 GET request to url and request to http://localhost', () => {
      ajaxRequest({
        method: 'GET',
        url: 'http://localhost',
      });
      assert.equal(1, requests.length);
      assert.equal('http://localhost', requests[0].url);
      assert.equal('GET', requests[0].method);
    });
  });

  describe('loadTemplate', () => {
    let xhr;
    let requests;
    let template;
    before(() => {
      xhr = sinon.useFakeXMLHttpRequest();
      requests = [];
      xhr.onCreate = (req) => { requests.push(req); };
    });

    it('should make another ajax request', () => {
      loadTemplate('../../../dist/particle/dummy-html.html').then((data) => {
        template = data;
      }).catch(() => {
        template = '';
      });
      requests[0].respond(200, { 'Content-Type': 'application/json' }, _template);
      assert.equal(1, requests.length);
    });

    it('should load template successful', () => {
      expect(template).to.equal(_template);
    });
  });

  describe('debounce', () => {
    let clock;

    beforeEach(() => {
      clock = sinon.useFakeTimers();
    });

    afterEach(() => {
      clock.restore();
    });

    it('Should no multiple call', () => {
      const func = sinon.spy();
      debounce(func);
      expect(func.calledOnce).to.be.false;

      clock.tick(1000);
      expect(func.calledOnce).to.be.true;
    });
  });

  describe('scrollToElement', () => {
    let _target;
    before((done) => {
      const noop = (option) => {
        window.scrollX = option.left;
        window.scrollY = option.top;
      };
      Object.defineProperty(global.window, 'scrollTo', { value: noop, writable: true });

      _target = global.document.createElement('div');
      _target.setAttribute('style', 'margin-top: 1000px;');
      global.document.body.setAttribute('style', 'position: relative;height: 2000px;');
      global.document.body.appendChild(_target);
      done();
    });

    it('Should scroll to 1000', () => {
      scrollToElement(_target, 0);
      setTimeout(() => {
        assert.equal(1000, global.window.scrollY);
      }, 100);
    });
  });

  describe('scrollToTop', () => {
    before((done) => {
      const noop = (x, y) => {
        window.scrollX = x;
        window.scrollY = y;
      };
      Object.defineProperty(global.window, 'scrollTo', { value: noop, writable: true });
      done();
    });

    it('Should scroll to 0', () => {
      setTimeout(() => {
        scrollToTop(60);
        setTimeout(() => {
          assert.equal(0, global.window.scrollY);
        }, 100);
      }, 300);
    });
  });

  describe('fireEvent', () => {
    let input;
    let _test = 0;
    before(() => {
      input = global.document.createElement('input');
      input.type = 'text';
      input.value = 0;
      input.addEventListener('change', () => {
        _test = input.value;
      });
    });
    it('should fire event change', () => {
      input.value = '2';
      fireEvent(input, 'change');
      expect(_test).to.equal('2');
    });
  });

  describe('processTemplate', () => {
    const data = { title: 'processTemplate' };
    const html = processTemplate(_template, data);
    it('should parse object data', () => {
      expect(html).to.equal('<div>this is template processTemplate</div>');
    });
  });

  describe('getAllDatesInMonth', () => {
    let _OctDays;
    let _NovDays;
    let _DecDays;
    before((done) => {
      _OctDays = getAllDatesInMonth(2019, 9);
      _NovDays = getAllDatesInMonth(2019, 10);
      _DecDays = getAllDatesInMonth(2019, 11);
      done();
    });

    it('Should return total days in time request', () => expect(_OctDays.length).to.equal(31) && expect(_NovDays.length).to.equal(30) && expect(_DecDays.length).to.equal(31));
  });

  describe('isToday', () => {
    let _NovDays;
    before((done) => {
      _NovDays = getAllDatesInMonth(2019, 10);
      done();
    });

    it('Should return false for not Today', () => expect(isToday(_NovDays[0])).to.be.false);
  });
});
