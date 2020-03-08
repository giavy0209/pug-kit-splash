import BlsTab from '../../../../core/brayleinosplash/plugins/bls_tabs/bls_tabs';

require('../../common');

const { JSDOM } = global.jsdom;

function testContructorSetting(instance) {
  expect(instance.elements.panels.length).to.equal(instance.elements.nav.li.length);
}

function testInitSetting(instance) {
  instance.should.have.keys('elements', 'open', 'setting', 'destroy');
}

describe('bls_tabs.js Test', () => {
  let instancesObject;
  let instancesDOM;

  before((done) => {
    JSDOM.fromFile('dist/tabs.html', {
      resources: 'usable',
    }).then((dom) => {
      global.window = dom.window;
      global.document = dom.window.document;
      instancesDOM = document.querySelectorAll('[data-bls-tabs]');
      instancesObject = new BlsTab();
    }).then(done).catch(error => console.log(error));
  });

  describe('constructor', () => {
    it('should return correct instances created: ', () => {
      assert(instancesDOM.length === instancesObject.length);
    });
  });

  describe('init', () => {
    it('instance should created with correct setting', () => {
      instancesObject.map(x => testContructorSetting(x));
    });

    it('instance should created with correct properties', () => {
      instancesObject.map(x => testInitSetting(x));
    });
  });

  describe('open', () => {
    let _panel;
    before((done) => {
      [_panel] = instancesObject[0].elements.panels.filter(x => x.classList.contains('active'));
      instancesObject[0].open(1);
      setTimeout(() => {
        done();
      }, 100);
    });

    it('should open correct panel', () => {
      [_panel] = instancesObject[0].elements.panels.filter(x => x.classList.contains('active'));
      expect(_panel.id).to.equal('tab2');
    });
  });
});
