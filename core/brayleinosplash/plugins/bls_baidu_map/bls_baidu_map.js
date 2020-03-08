// Baidu Map SDK demo: http://lbsyun.baidu.com/jsdemo.htm#a1_2
import { getSelectors } from '../../utils';

function _buildUI(instance) {
  const _instance = instance;

  const map = new BMap.Map(_instance.setting.selector.replace('#', ''));
  const point = new BMap.Point(116.404, 39.915);
  map.centerAndZoom(point, 15);
  // map.enableScrollWheelZoom();

  _instance.map = map;

  if (typeof _instance.setting.events.initMapComplete === 'function') _instance.setting.events.initMapComplete(_instance);
}

window.initBaiduMap = () => {
  window.blsBaiduMap.map((x) => {
    _buildUI(x.instance);
    return x;
  });
};

function _loadScript(instance) {
  const _instance = instance;

  const script = document.createElement('script');
  script.src = `//api.map.baidu.com/api?v=3.0&ak=${instance.setting.key}&callback=initBaiduMap`;

  script.onload = () => {
    // console.log('...loaded...');
  };

  const _scriptCheck = document.querySelectorAll(`script[src="${script.src}"]`);
  if (_scriptCheck.length === 0) {
    document.head.appendChild(script);
  } else _buildUI(_instance);
}

/**
 * Class constructor
 * @param {Object} setting setting for new instance plugin.
 * @param {String=} setting.selector The css selector query to get DOM elements will apply this plugin.
 * @param {Object=} setting.events Define callbacks for events.
 * @param {Function=} setting.events.initialized Callback will fire when 1 instance installed
 * @param {Function=} setting.events.initializedAll Callback will fire when ALL instances installed
 * @param {Function=} setting.events.initMapComplete Callback will fire when Baidu Map instances init successful
*/
class BlsBaiduMap {
  constructor(setting) {
    const defaultSetting = {
      selector: '[data-bls-baidu-map]',
      events: {
        initialized() {},
        initializedAll() {},
        initMapComplete() {},
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
    if (window.blsBaiduMap === undefined) window.blsBaiduMap = [];

    els.map((x) => {
      const _f = window.blsBaiduMap.filter(y => y.element === x);
      if (_f.length === 0) {
        const obj = {};
        const s = Object.assign({}, $this.setting, x.dataset || {});
        obj.setting = s;

        obj.elements = {
          origin: x,
        };
        obj.data = {};
        if (obj.setting.selected !== undefined) {
          obj.data.selected = obj.setting.selected;
        } else {
          obj.data.selected = [];
        }

        window.blsBaiduMap.push({
          instance: obj,
        });

        _loadScript(obj);

        $this.instances.push(obj);

        if (typeof obj.setting.events.initialized === 'function') obj.setting.events.initialized(obj);

        return obj;
      }
      return x;
    });

    if (typeof $this.setting.events.initializedAll === 'function') $this.setting.events.initializedAll(els);
  }
}

export default BlsBaiduMap;
