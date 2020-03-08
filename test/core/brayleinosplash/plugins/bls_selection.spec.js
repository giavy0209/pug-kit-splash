import BlsSelection from '../../../../core/brayleinosplash/plugins/bls_selection/bls_selection';
// import { convertNodeListToArray } from '../../../../core/brayleinosplash/utils';

require('../../common');

const { JSDOM } = global.jsdom;

describe('bls_selection.js Test', () => {
  let instancesObject;
  let instancesDOM;

  before((done) => {
    JSDOM.fromFile('dist/selection.html', {
      resources: 'usable',
    }).then((dom) => {
      global.window = dom.window;
      global.document = dom.window.document;
      instancesDOM = document.querySelectorAll('select[data-bls-selection]');
      instancesObject = new BlsSelection();
    }).then(done).catch(error => console.log(error));
  });

  describe('constructor', () => {
    it('should return correct instances created: ', () => {
      assert(instancesDOM.length === instancesObject.length);
    });

    it('custom list must equal to option list', () => {
      instancesObject.map((x, index) => assert(x.elements.options.querySelectorAll('li').length === instancesDOM[index].querySelectorAll('option').length));
      // assert(instancesDOM[0].querySelectorAll('option').length === instancesObject[0].elements.options.querySelectorAll('li').length);
    });
  });

  describe('value on init', () => {
    it('should return null if origin select don\'t have option selected: ', () => {
      assert(instancesObject[0].value === null);
    });

    it('should return correct value if origin select have option selected: ', () => {
      assert(instancesObject[1].value === '2');
    });

    it('should return array of values if origin select have multiple options selected: ', () => expect(instancesObject[2].value).to.be.an('array') && expect(instancesObject[2].value).to.include('2', '3', '4'));
  });

  describe('open', () => {
    it('should add class open to wrapper', () => {
      instancesObject[0].open();
      return expect(instancesObject[0].elements.wrapper.classList.contains('open')).to.be.true;
    });
  });

  describe('close', () => {
    it('should remove class open to wrapper', () => {
      instancesObject[0].close();
      return expect(instancesObject[0].elements.wrapper.classList.contains('open')).to.be.false;
    });
  });

  describe('events', () => {
    let _before = 0;
    let _after = 0;
    let _beforeSelect = 0;
    let _afterSelect = 0;
    let _beforeUnSelect = 0;
    let _afterUnSelect = 0;
    before((done) => {
      // reset value
      instancesObject[0].selectedIndex(0);

      instancesObject[0].setting.events.beforeOpen = () => {
        _before = 1;
      };
      instancesObject[0].setting.events.afterOpen = () => {
        _after = 1;
      };
      instancesObject[0].setting.events.beforeClose = () => {
        _before = 2;
      };
      instancesObject[0].setting.events.afterClose = () => {
        _after = 2;
      };
      instancesObject[0].setting.events.beforeSelect = (_instance) => {
        _beforeSelect = _instance.value;
      };
      instancesObject[0].setting.events.afterSelect = (_instance) => {
        _afterSelect = _instance.value;
      };
      instancesObject[0].setting.events.beforeUnSelect = (_instance) => {
        _beforeUnSelect = _instance.value;
      };
      instancesObject[0].setting.events.afterUnSelect = (_instance) => {
        _afterUnSelect = _instance.value;
      };
      done();
    });

    it('should call functions defined for beforeOpen and aferOpen and set new values', () => {
      instancesObject[0].open();
      return expect(_before).to.equal(1) && expect(_after).to.equal(1);
    });

    it('should call functions defined for beforeClose and aferClose and set new values', () => {
      instancesObject[0].close();
      return expect(_before).to.equal(2) && expect(_after).to.equal(2);
    });

    it('should call functions defined for beforeSelect and aferSelect and set new values', () => {
      instancesObject[0].selectedIndex(1);
      return expect(_beforeSelect).to.equal('1') && expect(_afterSelect).to.equal('2');
    });

    it('should do nothing cause these events only works with multiple selection', () => {
      instancesObject[0].selectedIndex(1);
      return expect(_beforeUnSelect).to.equal(0) && expect(_afterUnSelect).to.equal(0);
    });
  });

  describe('selected', () => {
    it('should set the correct value', () => {
      instancesObject[0].selected('1');
      return expect(instancesObject[0].value).to.equal('1');
    });

    it('should do nothing if no provide value', () => {
      instancesObject[0].selected();
      return expect(instancesObject[0].value).to.equal('1');
    });

    it('should set the correct value for multiple selection', () => {
      instancesObject[2].selected(['1', '2']);
      return expect(instancesObject[2].value).to.be.an('array') && expect(instancesObject[2].value).to.include('1', '2');
    });
  });

  describe('selectedIndex', () => {
    it('should set the correct value', () => {
      instancesObject[0].selectedIndex(1);
      return expect(instancesObject[0].value).to.equal('2');
    });
    it('should do nothing if no provide index', () => {
      instancesObject[0].selectedIndex();
      return expect(instancesObject[0].value).to.equal('2');
    });
    it('should set the correct value for multiple selection', () => {
      instancesObject[2].selectedIndex([1, 2, 3]);
      return expect(instancesObject[2].value).to.be.an('array') && expect(instancesObject[2].value).to.include('2', '3', '4');
    });
  });

  describe('currentIndex', () => {
    it('should get the correct index', () => expect(instancesObject[0].currentIndex()).to.equal(1));
  });

  describe('destroy', () => {
    it('should reset instance', () => {
      instancesObject[0].destroy();
      return expect(instancesObject[0].elements.select.classList.contains('invisible')).to.be.false;
    });
  });
});
