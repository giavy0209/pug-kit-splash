import BlsScript from '../../../../core/brayleinosplash/plugins/bls_script/bls_script';
import { convertNodeListToArray, fireEvent } from '../../../../core/brayleinosplash/utils';

require('../../common');

const { JSDOM } = global.jsdom;

describe('bls_script.js Test', () => {
  let instancesObject = [];
  let instancesDOM = [];
  let _afterLoaded = 0;

  before((done) => {
    const dom = new JSDOM('', { runScripts: 'dangerously' });
    global.window = dom.window;
    global.document = dom.window.document;

    const _div = document.createElement('div');
    _div.setAttribute('data-bls-script', '');
    _div.setAttribute('data-src', 'http://bls-frontend.local:3100/tabs.min.js');
    document.body.appendChild(_div);

    const _divMulti = document.createElement('div');
    _divMulti.setAttribute('data-bls-script', '');
    _divMulti.setAttribute('data-src', 'http://bls-frontend.local:3100/accordion.min.js|http://bls-frontend.local:3100/selection.min.js');
    document.body.appendChild(_divMulti);

    const _divHead = document.createElement('div');
    _divHead.setAttribute('data-bls-script', '');
    _divHead.setAttribute('data-location', 'head');
    _divHead.setAttribute('data-src', 'http://bls-frontend.local:3100/carousel.min.js');
    document.body.appendChild(_divHead);

    instancesObject = new BlsScript();
    instancesDOM = document.querySelectorAll('[data-bls-script]');

    instancesObject[0].setting.events.afterLoaded = () => {
      _afterLoaded = 1;
    };

    done();
  });

  describe('constructor', () => {
    it('should create correct total number of instances', () => {
      // assert(instancesObject);
      assert(instancesDOM.length === instancesObject.length);
    });
  });

  describe('init', () => {
    it('should create correct scripts follow order', () => {
      const _scripts = convertNodeListToArray(document.body.querySelectorAll('script'));
      return expect(_scripts[0].getAttribute('src')).to.equal('http://bls-frontend.local:3100/tabs.min.js')
      && expect(_scripts[1].getAttribute('src')).to.equal('http://bls-frontend.local:3100/accordion.min.js')
      && expect(_scripts[2].getAttribute('src')).to.equal('http://bls-frontend.local:3100/selection.min.js');
    });

    it('should create correct scripts at location', () => {
      const _scripts = convertNodeListToArray(document.body.querySelectorAll('script'));
      const _scriptH = convertNodeListToArray(document.head.querySelectorAll('script'));
      return expect(_scripts.length).to.equal(3) && expect(_scriptH.length).to.equal(1);
    });
  });

  describe('events', () => {
    it('should run afterLoaded callback', () => {
      // assert(instancesObject);
      const _scripts = convertNodeListToArray(document.body.querySelectorAll('script'));
      fireEvent(_scripts[0], 'load');
      expect(_afterLoaded).to.equal(1);
    });
  });

  describe('duplicate script', () => {
    let _duplicate;
    let _duplicateLoaded = 0;
    before((done) => {
      const _div = document.createElement('div');
      _div.setAttribute('id', 'scriptDuplicated');
      _div.setAttribute('data-bls-script', '');
      _div.setAttribute('data-src', 'http://bls-frontend.local:3100/tabs.min.js');
      document.body.appendChild(_div);
      _duplicate = new BlsScript({
        selector: '#scriptDuplicated',
        events: {
          afterLoaded() {
            _duplicateLoaded = 1;
          },
        },
      });
      done();
    });
    it('should not append script that already appended', () => {
      // assert(instancesObject);
      expect(document.querySelectorAll('script[src="http://bls-frontend.local:3100/tabs.min.js"]').length).to.equal(1);
    });
    it('should run afterLoaded callback', () => {
      // assert(instancesObject);
      expect(_duplicateLoaded).to.equal(1);
    });
  });
});
