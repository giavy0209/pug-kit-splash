import BlsTruncate from '../../../../core/brayleinosplash/plugins/bls_truncatehtml/bls_truncatehtml';
import { fireEvent } from '../../../../core/brayleinosplash/utils';

require('../../common');

const { JSDOM } = global.jsdom;

function testContructorSetting(instance) {
  // expect(instance.setting.target).to.equal(instance.elements.btn.dataset.target);
}

function testInitSetting(instance) {
  instance.should.have.keys('close', 'elements', 'open', 'setting', 'destroy');
}

describe('bls_accordion.js Test', () => {
  let instancesObject = [];
  let instancesDOM = [];

  before((done) => {
    JSDOM.fromFile('dist/truncatehtml.html', {
      resources: 'usable',
      // runScripts: 'dangerously',
    }).then((dom) => {
      global.window = dom.window;
      global.document = dom.window.document;
      // instancesDOM = global.document.querySelectorAll('button[data-bls-accordion]');
      // instancesObject = new BlsAccordion();
    }).then(done).catch(error => console.log(error));
  });

  describe('constructor', () => {
    it('should create correct total number of instances', () => {
      // assert(instancesObject);
      // assert(instancesDOM.length === instancesObject.length);
    });
  });

  describe('init', () => {
    it('instance should created with correct setting', () => {
      // instancesObject.map(x => testContructorSetting(x));
    });

    it('instance should created with correct properties', () => {
      // instancesObject.map(x => testInitSetting(x));
    });
  });

  // describe('open', () => {
  //   let _panels;
  //   before((done) => {
  //     _panels = instancesObject[0].elements.panel;
  //     instancesObject[0].open();
  //     setTimeout(() => {
  //       _panels.map(x => fireEvent(x, 'transitionend'));
  //       done();
  //     }, 300);
  //   });

  //   it('should open correct panels', () => {
  //     _panels.map(x => expect(x.classList.contains('active')).to.be.true);
  //   });
  // });

  // describe('close', () => {
  //   let _panels;
  //   before((done) => {
  //     _panels = instancesObject[0].elements.panel;
  //     instancesObject[0].close();
  //     setTimeout(() => {
  //       _panels.map(x => fireEvent(x, 'transitionend'));
  //       done();
  //     }, 300);
  //   });

  //   it('should close correct panels', () => {
  //     _panels.map(x => expect(x.classList.contains('active')).to.be.false);
  //   });
  // });

  // describe('accordion', () => {
  //   let _panelsNo3;
  //   let _panelsNo4;
  //   before((done) => {
  //     _panelsNo3 = instancesObject[3].elements.panel;
  //     _panelsNo4 = instancesObject[4].elements.panel;
  //     instancesObject[3].open();
  //     setTimeout(() => {
  //       _panelsNo3.map(x => fireEvent(x, 'transitionend'));
  //       instancesObject[4].open();
  //       setTimeout(() => {
  //         _panelsNo3.map(x => fireEvent(x, 'transitionend'));
  //         _panelsNo4.map(x => fireEvent(x, 'transitionend'));
  //         done();
  //       }, 300);
  //     }, 300);
  //   });

  //   it('should open close panels of instance 3 and open panels of instance 4', () => {
  //     _panelsNo3.map(x => expect(x.classList.contains('active')).to.be.false);
  //     _panelsNo4.map(x => expect(x.classList.contains('active')).to.be.true);
  //   });
  // });
});
