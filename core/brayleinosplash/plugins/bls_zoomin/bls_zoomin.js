import '../../polyfill';
import { getSelectors } from '../../utils';

function _buildUI(instance) {

}

const _zoomHandle = (instance, e) => {
  e.preventDefault();
  e.stopPropagation();
};

function _buildEvents(instance) {
  if (window.blsZoomIn !== undefined) {
    window.blsZoomIn.map((x) => {
      if (x.element === instance.elements.target) {
        instance.elements.target.removeEventListener('mouseenter', x.zoomHandle);
        instance.elements.target.addEventListener('mouseenter', x.zoomHandle);
      }
      return x;
    });
  } else {
    instance.elements.target.addEventListener('mouseenter', e => _zoomHandle(instance, e));
  }
}

function _buildPublicMethod(instance) {

  instance.destroy = () => {
    const _arr = [];
    window.blsZoomIn.map((x) => {
      if (x.element === instance.elements.target) {
        instance.elements.target.removeEventListener('click', x.zoomHandle);
      } else {
        _arr.push(x);
      }
      return x;
    });
    window.blsZoomIn = _arr;
  };
}

class BlsZoomIn {
  constructor(setting) {
    const defaultSetting = {
      selector: '[data-bls-zoomin]',
      zoom: 2,
      events: {
        initialized() {},
        initializedAll() {},
      },
    };

    const s = Object.assign({}, defaultSetting, setting || {});
    this.setting = s;
    this.setting.length = parseFloat(this.setting.length);
    this.instances = [];
    this.init(s);

    return this.instances;
  }

  init(setting) {
    const $this = this;
    const els = getSelectors(setting.selector);
    if (window.blsZoomIn === undefined) window.blsZoomIn = [];

    els.map((x) => {
      const _f = window.blsZoomIn.filter(y => y.element === x);
      if (_f.length === 0) {
        const obj = {};
        const s = Object.assign({}, $this.setting, x.dataset || {});
        obj.setting = s;

        obj.setting.length = parseFloat(obj.setting.length);

        obj.elements = {
          target: x.children.length > 0 ? x.children[0] : x,
        };

        window.blsZoomIn.push({
          element: x,
          zoomHandle: _zoomHandle.bind(null, obj),
        });

        _buildEvents(obj);
        _buildPublicMethod(obj);

        $this.instances.push(obj);

        if (typeof obj.setting.events.initialized === 'function') obj.setting.events.initialized(obj);

        return obj;
      }
      return x;
    });

    if (typeof $this.setting.events.initializedAll === 'function') $this.setting.events.initializedAll(els);
  }
}

export default BlsZoomIn;
