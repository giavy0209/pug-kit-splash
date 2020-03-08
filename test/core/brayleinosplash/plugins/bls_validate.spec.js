import BlsValidation from '../../../../core/brayleinosplash/plugins/bls_validation/bls_validation';
import { fireEvent } from '../../../../core/brayleinosplash/utils';

require('../../common');

const { JSDOM } = global.jsdom;

function testContructorSetting(instance, form) {
  return expect(instance.elements.requires.length).to.equal(form.querySelectorAll('[required]').length)
  && expect(instance.elements.patterns.length).to.equal(form.querySelectorAll('[pattern]').length);
}

function testInitSetting(instance) {
  instance.should.have.keys('elements', 'data', 'setting');
}

describe('bls_validation.js Test', () => {
  let instancesObject;
  let instancesDOM;

  before((done) => {
    JSDOM.fromFile('dist/validate.html', {
      resources: 'usable',
    }).then((dom) => {
      global.window = dom.window;
      global.document = dom.window.document;
      instancesDOM = document.querySelectorAll('form[data-bls-validation]');
      instancesObject = new BlsValidation();
    }).then(done).catch(error => console.log(error));
  });

  describe('constructor', () => {
    it('should return correct instances created: ', () => {
      assert(instancesDOM.length === instancesObject.length);
    });
  });

  describe('init', () => {
    it('instance should created with correct setting', () => {
      instancesObject.map((x, index) => testContructorSetting(x, instancesDOM[index]));
    });

    it('instance should created with correct properties', () => {
      instancesObject.map(x => testInitSetting(x));
    });
  });

  describe('validate before submit', () => {
    it('should add invalid for all required fields', () => {
      instancesObject[0].elements.form.submit();
      const _requires = instancesDOM[0].querySelectorAll('.invalid[required]');
      expect(_requires.length).to.equal(instancesObject[0].elements.requires.length);
    });
    it('should create error elements', () => {
      const _errors = instancesDOM[0].querySelectorAll('.error');
      expect(_errors.length).to.equal(instancesObject[0].elements.requires.length - 2);
    });
  });

  describe('validate with change/focusout/input event', () => {
    it('should run validate for field that fire event input', () => {
      const [_require] = instancesObject[0].elements.requires;
      _require.value = 'Should remove class invalid';
      fireEvent(_require, 'input');
      return expect(_require.classList.contains('invalid')).to.be.false
      && expect(_require.classList.contains('success')).to.be.true;
    });

    it('should run validate for field that fire event focusout', () => {
      const [_require] = instancesObject[0].elements.requires;
      _require.value = '';
      fireEvent(_require, 'focusout');
      return expect(_require.classList.contains('invalid')).to.be.true
      && expect(_require.classList.contains('success')).to.be.false;
    });

    it('should run validate for field that fire event change', () => {
      const [, _require] = instancesObject[0].elements.requires;
      _require.value = 1;
      fireEvent(_require, 'change');
      return expect(_require.classList.contains('invalid')).to.be.false
      && expect(_require.classList.contains('success')).to.be.true;
    });

    it('should run validate for field that fire event change', () => {
      const [,,,,,, _require] = instancesObject[0].elements.requires;
      _require.value = '123';
      fireEvent(_require, 'change');
      return expect(_require.classList.contains('invalid')).to.be.false
      && expect(_require.classList.contains('success')).to.be.true;
    });

    it('should run add success for files that pass validate required', () => {
      instancesObject[0].elements.requires.map((x) => {
        if (x.nodeName !== 'SELECT') {
          x.value = 'abc';
        } else {
          x.value = '1';
        }
        fireEvent(x, 'change');
        return x;
      });
      expect(instancesObject[0].elements.form.querySelectorAll('.success').length).to.equal(4);
    });
  });

  describe('validate with patterns', () => {
    it('should add invalid for all patterns fields', () => {
      instancesObject[0].elements.patterns.map((x) => {
        x.value = '1';
        return x;
      });
      instancesObject[0].elements.form.submit();
      const _patterns = instancesDOM[0].querySelectorAll('.invalid[pattern]');
      return expect(_patterns.length).to.equal(instancesObject[0].elements.patterns.length) && expect(_patterns.length).to.equal(5);
    });

    it('should add success for all patterns fields', () => {
      instancesObject[0].elements.patterns[0].value = 'email@email.com';
      fireEvent(instancesObject[0].elements.patterns[0], 'change');
      instancesObject[0].elements.patterns[1].value = '+123456789';
      fireEvent(instancesObject[0].elements.patterns[1], 'change');
      instancesObject[0].elements.patterns[2].value = 123;
      fireEvent(instancesObject[0].elements.patterns[2], 'change');
      instancesObject[0].elements.patterns[3].value = 50;
      fireEvent(instancesObject[0].elements.patterns[3], 'change');
      const _patterns = instancesDOM[0].querySelectorAll('.success[pattern]');
      return expect(_patterns.length).to.equal(instancesObject[0].elements.patterns.length - 2) && expect(_patterns.length).to.equal(3);
    });
  });

  describe('method doSuccess', () => {
    let _doSuccess = 0;
    before((done) => {
      instancesObject[0].setting.events.doSuccess = () => {
        _doSuccess = 1;
      };
      instancesObject[0].elements.form.submit();
      done();
    });

    it('should not call function doSuccess', () => {
      expect(_doSuccess).to.equal(0);
    });
  });
});
