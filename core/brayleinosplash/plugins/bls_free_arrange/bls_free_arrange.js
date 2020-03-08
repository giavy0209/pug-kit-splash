import './bls_free_arrange.scss';
import { getSelectors, convertNodeListToArray } from '../../utils';

function _calculateUI(instance) {
  const _instance = instance;
  let _height = 0;
  let _row = 0;
  let _first = null;

  switch (_instance.setting.mode) {
    case 'fill':
      break;
    case 'mixed':
      break;
    default:
      _instance.elements.items.map((x, index) => {
        x.classList.add('bls-free-arrange__item');
        x.dataset.index = index;

        x.style.left = 0;
        x.style.top = 0;
        let _nextLeft;
        let _nextTop;

        if (index > 0) {

          if (_row === 0) {
            _nextLeft = parseInt(_instance.elements.items[index - 1].style.left, 0) + _instance.elements.items[index - 1].offsetWidth + _instance.setting.spacing.left;
            _nextTop = 0;
          } else {
            _nextLeft = parseInt(_instance.elements.items[index - 1].style.left, 0) + _instance.elements.items[index - 1].offsetWidth + _instance.setting.spacing.left;
            _nextTop = parseInt(_instance.elements.items[index - 1].style.top, 0);
          }

          if (_nextLeft + x.offsetWidth > _instance.elements.wrapper.offsetWidth) {
            _nextLeft = 0;
            _nextTop += _first.offsetHeight + _instance.setting.spacing.top;
            _height += parseInt(_nextTop, 0) + x.offsetHeight;
            x.dataset.first = true;
            _first = x;
            _instance.elements.items[index - 1].dataset.last = true;
            _row += 1;
          }

          // check if overlap previous item


          x.style.left = `${_nextLeft}px`;
          x.style.top = `${_nextTop}px`;
        } else {
          x.dataset.first = true;
          _first = x;
        }
        x.dataset.row = _row;
        return x;
      });
  }

  _instance.elements.wrapper.style.height = `${_height}px`;
}

function _buildUI(instance) {
  const _instance = instance;
  _instance.elements.wrapper.classList.add('bls-free-arrange', 'loading');
  _calculateUI(_instance);
}

function _bindEvents(instance) {
  const _instance = instance;
}

function _bindPublicMethod(instance) {
  const _instance = instance;
}

class BlsFreeArrange {
  /**
   * Class constructor
   * @param {Object} setting setting for new instance plugin.
   * @param {String} setting.selector The css selector query to get DOM elements will apply this plugin.
   * @param {Object} setting.events Define callbacks for events.
   * @param {Function} setting.events.initialized Callback will fire when 1 instance installed
   * @param {Function} setting.events.initializedAll Callback will fire when ALL instances installed
  */
  constructor(setting) {
    const defaultSetting = {
      selector: '[data-bls-freearrange]',
      spacing: {
        left: 10,
        top: 10,
      },
      mode: 'rows', // fill, column
      events: {
        initialized() {},
        initializedAll() {},
      },
    };

    const s = Object.assign({}, defaultSetting, setting || {});

    s.spacing.left = parseInt(s.spacing.left, 0);
    s.spacing.top = parseInt(s.spacing.top, 0);

    this.setting = s;
    this.instances = [];
    this.init(s);

    return this.instances;
  }

  init(setting) {
    const $this = this;
    const els = getSelectors(setting.selector);

    if (window.blsFreeArrange === undefined) window.blsFreeArrange = [];
    els.map((x) => {
      const _f = window.blsFreeArrange.filter(y => y.element === x);
      if (_f.length === 0) {
        const obj = {};
        // redefine setting for each instance here
        const s = Object.assign({}, $this.setting, x.dataset || {});
        if (s.spacingLeft) s.spacing.left = parseInt(s.spacingLeft, 0);
        if (s.spacingTop) s.spacing.top = parseInt(s.spacingTop, 0);

        obj.setting = s;

        obj.elements = {
          wrapper: x,
          items: convertNodeListToArray(x.children),
        };

        window.blsFreeArrange.push({
          element: x,
        });

        _buildUI(obj);
        _bindEvents(obj);
        _bindPublicMethod(obj);

        $this.instances.push(obj);

        if (typeof obj.setting.events.initialized === 'function') obj.setting.events.initialized(obj);

        return obj;
      }
      return x;
    });

    if (typeof $this.setting.events.initializedAll === 'function') $this.setting.events.initializedAll(els);
  }
}

export default BlsFreeArrange;
