import './bls_dropdown.scss';
import { convertNodeListToArray, getSelectors } from '../../utils';

/* Private Method */
function _calculatePosition(instance) {
  const _bodyH = document.body.offsetHeight;
  const _scrollTop = document.documentElement.scrollTop;
  const _elPos = instance.elements.control.getBoundingClientRect();
  if (_elPos.top + _scrollTop + instance.elements.menu.offsetHeight > _bodyH) {
    instance.elements.wrapper.classList.add('pos-bottom');
  } else {
    instance.elements.wrapper.classList.add('pos-top');
  }
}

const _clickEventHandle = (instance, e) => {
  if (e.target === instance.elements.control) {
    e.stopPropagation();
    if (instance.elements.wrapper.classList.contains('open')) {
      if (typeof instance.setting.events.beforeClose === 'function') instance.setting.events.beforeClose(instance);

      instance.elements.control.classList.remove('open');
      instance.elements.menu.classList.remove('open');
      instance.elements.wrapper.classList.remove('open');

      if (typeof instance.setting.events.afterClose === 'function') instance.setting.events.afterClose(instance);
    } else {
      if (typeof instance.setting.events.beforeOpen === 'function') instance.setting.events.beforeOpen(instance);
      instance.elements.wrapper.classList.add('overflow-hidden');

      instance.elements.control.classList.add('open');
      instance.elements.menu.classList.add('open');
      instance.elements.wrapper.classList.add('open');

      _calculatePosition(instance);
      instance.elements.wrapper.classList.remove('overflow-hidden');
      if (typeof instance.setting.events.afterOpen === 'function') instance.setting.events.afterOpen(instance);
    }
  }
};

const _clickOutsideHandle = (e) => {
  e.stopPropagation();
  window.blsDropdown.map((x) => {
    if (x.elements.control.classList.contains('open')) {
      x.instance.close();
    }
    return x;
  });
};

function _bindMethodClickOpen(instance) {
  if (window.blsDropdown !== undefined) {
    window.blsDropdown.map((x) => {
      if (x.element === instance.elements.control) {
        instance.elements.control.removeEventListener('click', x.clickEventHandle);
        instance.elements.control.addEventListener('click', x.clickEventHandle);
      }
      return x;
    });
  } else {
    instance.elements.control.addEventListener('click', e => _clickEventHandle(e));
  }
}

function _bindEventClickOutside() {
  document.addEventListener('click', _clickOutsideHandle);
}

function _buildPublicMethod(instance) {
  const _instance = instance;
  _instance.open = () => {
    if (!_instance.elements.wrapper.classList.contains('open')) {
      _instance.elements.control.click();
    }
  };

  _instance.close = () => {
    if (_instance.elements.wrapper.classList.contains('open')) {
      _instance.elements.control.click();
    }
  };

  _instance.destroy = () => {
    const _arr = [];
    window.blsDropdown.map((x) => {
      if (x.element === instance.elements.control) {
        instance.elements.control.removeEventListener('click', x.clickEventHandle);
      } else {
        _arr.push(x);
      }
      return x;
    });
    window.blsDropdown = _arr;
  };
}

/* End private method */

class BlsDropdown {
  /**
   * Class constructor
   * @param {Object=} setting setting for new instance plugin.
   * @param {String=} setting.selector The css selector query to get DOM elements will apply this plugin.
   * @param {Object=} setting.events Define callbacks for events.
   * @param {Function=} setting.events.beforeOpen Callback will fire before dropdown instance open
   * @param {Function=} setting.events.afterOpen Callback will fire before dropdown instance open
   * @param {Function=} setting.events.beforeClose Callback will fire before dropdown instance close
   * @param {Function=} setting.events.afterClose Callback will fire before dropdown instance close
  */
  constructor(setting) {
    const defaultSetting = {
      selector: 'button[data-bls-dropdown]',
      events: {
        initialized() {},
        initializedAll() {},
        beforeOpen() {},
        afterOpen() {},
        beforeClose() {},
        afterClose() {},
      },
    };

    const s = Object.assign({}, defaultSetting, setting || {});
    this.setting = s;
    this.instances = [];
    this.init(s);

    return this.instances;
  }

  init(setting) {
    const $this = this;
    const els = getSelectors(setting.selector);

    if (window.blsDropdown === undefined) window.blsDropdown = [];
    const _firstTime = window.blsDropdown.length === 0;
    // const _arr = window.blsDropdown === undefined ? [] : window.blsDropdown;
    els.map((x) => {
      const _f = window.blsDropdown.filter(y => y.element === x);
      if (_f.length === 0) {
        const obj = { value: null };
        // redefine setting for each instance here
        const s = Object.assign({}, $this.setting, x.dataset || {});

        obj.setting = s;

        obj.elements = {
          control: x,
          menu: document.querySelector(obj.setting.target),
        };

        if (obj.elements.menu === null) {
          obj.elements.menu = x.nextElementSibling;
        }

        obj.elements.wrapper = obj.elements.menu.parentNode;
        obj.elements.menuItems = convertNodeListToArray(obj.elements.menu.children);

        if (!obj.elements.menu.classList.contains('bls-dropdown__menu')) {
          obj.elements.menu.classList.add('bls-dropdown__menu');
        }

        if (!obj.elements.wrapper.classList.contains('bls-dropdown')) {
          obj.elements.wrapper.classList.add('bls-dropdown');
        }

        window.blsDropdown.push({
          element: x,
          elements: obj.elements,
          instance: obj,
          clickEventHandle: _clickEventHandle.bind(null, obj),
        });

        _bindMethodClickOpen(obj);
        _buildPublicMethod(obj);

        $this.instances.push(obj);
        // _arr.push(obj);

        if (typeof obj.setting.events.initialized === 'function') obj.setting.events.initialized(obj);
        return obj;
      }
      return x;
    });
    // window.blsDropdown = _arr;

    if (_firstTime) _bindEventClickOutside();
    if (typeof $this.setting.events.initializedAll === 'function') $this.setting.events.initializedAll($this.instances);
  }
}

export default BlsDropdown;
