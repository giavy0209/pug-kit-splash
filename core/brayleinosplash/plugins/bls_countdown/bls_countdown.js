import '../../polyfill';
import { getSelectors } from '../../utils';

function _calculateTime(instance) {
  const _distance = instance.data.deadline - new Date().getTime();

  // Time calculations for days, hours, minutes and seconds
  const days = Math.floor(_distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((_distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((_distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((_distance % (1000 * 60)) / 1000);

  instance.data.d = days < 10 ? `0${days}` : days;
  instance.data.h = hours < 10 ? `0${hours}` : hours;
  instance.data.m = minutes < 10 ? `0${minutes}` : minutes;
  instance.data.s = seconds < 10 ? `0${seconds}` : seconds;

  instance.elements.d.innerText = instance.data.d;
  instance.elements.h.innerText = instance.data.h;
  instance.elements.m.innerText = instance.data.m;
  instance.elements.s.innerText = instance.data.s;

  if (_distance <= 0) {
    clearInterval(instance.timer);
    instance.elements.d.innerText = '00';
    instance.elements.h.innerText = '00';
    instance.elements.m.innerText = '00';
    instance.elements.s.innerText = '00';

    if (typeof instance.setting.events.end === 'function') instance.setting.events.end(instance);
  }
}

class BlsCountdown {
  /**
   * Class constructor
   * @param {Object} setting setting for new instance plugin.
   * @param {String} setting.selector The css selector query to get DOM elements will apply this plugin.
   * @param {Object} setting.events Define callbacks for events.
   * @param {Function} setting.events.initialized Callback will fire when 1 instance installed
   * @param {Function} setting.events.initializedAll Callback will fire when ALL instances installed
   * @param {Function} setting.events.end Callback will fire when ALL instances installed
  */
  constructor(setting) {
    const defaultSetting = {
      selector: '[data-bls-countdown]',
      events: {
        initialized() {},
        initializedAll() {},
        end() {},
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
    if (window.blsCountdown === undefined) window.blsCountdown = [];

    els.map((x) => {
      const _f = window.blsCountdown.filter(y => y.element === x);
      if (_f.length === 0) {
        const obj = {};
        const s = Object.assign({}, $this.setting, x.dataset || {});
        obj.setting = s;

        obj.elements = {
          wrapper: x,
          d: x.querySelector('.day > span'),
          h: x.querySelector('.hour > span'),
          m: x.querySelector('.minute > span'),
          s: x.querySelector('.second > span'),
        };

        // console.log(s.target);
        obj.data = {
          deadline: new Date(s.target).getTime(),
        };

        const _t = setInterval(() => {
          _calculateTime(obj);
        }, 1000);
        obj.timer = _t;

        $this.instances.push(obj);
        if (typeof obj.setting.events.initialized === 'function') obj.setting.events.initialized(obj);
        return obj;
      }
      return x;
    });

    if (typeof $this.setting.events.initializedAll === 'function') $this.setting.events.initializedAll(els);
  }
}
export default BlsCountdown;
