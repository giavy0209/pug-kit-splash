import BlsCarousel from '../../../../core/brayleinosplash/plugins/bls_carousel/bls_carousel';
import { fireEvent } from '../../../../core/brayleinosplash/utils';

require('../../common');

const { JSDOM } = global.jsdom;

function testContructorSetting(instance) {
  return expect(instance.setting.items).to.be.a('number')
  && expect(instance.setting.itemsMove).to.be.a('number')
  && expect(instance.setting.spacing).to.be.a('number')
  && expect(instance.setting.loop).to.be.a('boolean')
  && expect(instance.setting.auto).to.be.a('boolean');
}

function testInitSetting(instance) {
  instance.should.have.keys('data', 'elements', 'setting', 'goNext', 'goPrevious', 'goToPage', 'refresh', 'destroy', 'info', 'stopAuto');
}

function testUIAfterBuild(instance) {
  return expect(instance.elements).to.have.property('wrapper')
  && expect(instance.elements).to.have.property('slider')
  && expect(instance.elements).to.have.property('nav')
  && expect(instance.elements).to.have.property('dots')
  && expect(instance.elements.wrapper.classList.contains('bls-carousel')).to.be.true
  && expect(instance.elements.nav.classList.contains('bls-carousel__nav')).to.be.true
  && expect(instance.elements.dots.classList.contains('bls-carousel__dots')).to.be.true;
}

describe('bls_carousel.js Test', () => {
  let instancesObject = [];
  let instancesDOM = [];
  let _noLoop;
  let _withLoop;
  before((done) => {
    JSDOM.fromFile('dist/carousel.html', {
      resources: 'usable',
      // runScripts: 'dangerously',
    }).then((dom) => {
      global.window = dom.window;
      global.document = dom.window.document;
      instancesDOM = global.document.querySelectorAll('[data-bls-carousel]');
      instancesObject = new BlsCarousel();

      [_noLoop] = instancesObject;
      [, _withLoop] = instancesObject;
    }).then(done).catch(error => console.log(error));
  });

  describe('constructor', () => {
    it('should create correct total number of instances', () => {
      // assert(instancesObject);
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

    describe('buildUI', () => {
      it('instance should created 4 element: 1 = wrapper, 2 = slider, 3 = nav and 4 = dots', () => {
        instancesObject.map(x => testUIAfterBuild(x));
      });

      describe('buildDot', () => {
        it('instance should created correct number of dot', () => expect(_noLoop.data.pages.total).to.equal(10) && expect(_noLoop.elements.dots.children.length).to.equal(10));
      });
    });
  });
});
