import Hammer from 'hammerjs';

import './bls_coverflow.scss';
import {
  convertNodeListToArray, wrap, debounce, getSelectors,
} from '../../utils';
// import BlsLazyElement from '../bls_lazy/bls_lazy';

const maxAngle = Math.PI * 2;

function _calculateUI(instance) {
  const _instance = instance;

  if (_instance.setting.type === 'linear') {
    const _center = (_instance.data.width - _instance.elements.items[0].offsetWidth) / 2;
    const _end = _instance.data.width - _instance.elements.items[0].offsetWidth;
    const _distance = _end - _center;
    const _steps = _distance / _instance.data.total;

    _instance.elements.items.map((x, index) => {
      const _newIndex = index - _instance.data.current;
      let _n = _newIndex;
      let _rotate = 0;
      if (_newIndex > 0) {
        _n = 1;
        _rotate = -10;
      } else if (_newIndex < 0) {
        _n = -1;
        _rotate = 10;
      }
      let _origin = _newIndex < 0 ? 'left center' : 'right center';

      if (_instance.setting.path === 'concave') {
        _rotate *= -1;
        _origin = _newIndex > 0 ? 'left center' : 'right center';
      }

      if (_newIndex === 0) _origin = 'center center';
      const _ratio = 0.5 + (50 - Math.abs(_newIndex) * (50 / _instance.data.total)) / 100;

      x.style.left = `${_center - (_steps * _newIndex) - (_n * _instance.elements.items[0].offsetWidth / 2)}px`;
      x.style.transform = `scale(${_ratio},${_ratio}) rotateY(${_rotate}deg)`;
      x.style.transformOrigin = _origin;
      x.style.zIndex = _instance.data.total - Math.abs(_newIndex);
      return x;
    });
  } else {
    const maxHeight = _instance.setting.height;
    const maxWidth = _instance.setting.width;

    const z = [];
    _instance.elements.items.map((el, index) => {
      let _newIndex = index - _instance.data.current;
      if (_newIndex < 0) _newIndex += _instance.data.total;
      const a = _instance.data.itemAngle[_newIndex] - _instance.data.angle;
      const x = Math.round(Math.sin(a) * 1000000) / 1000000;
      const y = Math.round(Math.cos(a) * 1000000) / 1000000;

      const _ratio = 0.2 + (1 + y) * 0.4;

      const w = _ratio * maxWidth;
      const h = _ratio * maxHeight;

      z.push({ el, y });
      el.style.left = `${((_instance.data.width - w) / 2) + x * (_instance.data.width / 4)}px`;


      if (parseInt(_instance.setting.directionZ, 0) === -1) {
        el.style.bottom = `${_instance.data.height - h}px`;
      } else {
        el.style.top = `${((maxHeight - h))}px`;
      }

      el.style.height = `${h}px`;
      el.style.width = `${w}px`;

      return el;
    });

    z.sort((a, b) => { if (a.y > b.y) return 1; if (a.y < b.y) return -1; return 0; });

    for (let i = 0; i < _instance.data.total; i += 1) {
      z[i].el.style.zIndex = i * 10;
    }
  }
}

function _animateSlide(instance) {
  const _instance = instance;

  if (_instance.setting.type === 'linear') {
    _instance.data.canGoPrev = _instance.data.current > 0;
    _instance.data.canGoNext = _instance.data.current < _instance.data.total - 1;
  }

  if (typeof _instance.setting.events.beforeChange === 'function') _instance.setting.events.beforeChange(instance);
  _instance.data.isMoving = true;
  _calculateUI(instance);

  return _instance;
}

function _reCalculateUI(instance) {
  instance.data.width = instance.elements.container.offsetWidth;
  instance.data.Height = instance.elements.container.offsetHeight;
  _animateSlide(instance);
}

function _moveSlide(instance, direction, steps) {
  const _instance = instance;
  const _direction = direction;

  if (_instance.setting.type === 'linear') {
    if (_direction === 1 && !_instance.data.canGoNext) return false;
    if (_direction === -1 && !_instance.data.canGoPrev) return false;
  }

  if (steps === undefined) {
    if (_direction > 0) {
      _instance.data.current += 1;
    } else {
      _instance.data.current -= 1;
    }
    if (_instance.setting.type === 'circle') {
      if (_instance.data.current < 0) _instance.data.current = _instance.data.total - 1;
      if (_instance.data.current > _instance.data.total - 1) _instance.data.current = 0;
    }
  }

  _animateSlide(_instance);

  return _instance;
}

function _goToPage(instance, page) {
  if (page < 0 || page > instance.data.total) return false;
  if (page === instance.data.current) return false;
  const _direction = instance.data.current < page ? 1 : -1;
  instance.data.current = page;
  _moveSlide(instance, _direction, page);
  return instance;
}

const _loadHandle = (instance) => {
  _calculateUI(instance);
};

const _navHandle = (instance, e) => {
  e.preventDefault();
  e.stopPropagation();
  if (instance.data.isMoving) return false;
  if (e.target.classList.contains('bls-coverflow__button--prev')) {
    _moveSlide(instance, -1);
    return true;
  }

  if (e.target.classList.contains('bls-coverflow__button--next')) {
    _moveSlide(instance, 1);
    return true;
  }

  return true;
};

const _dotHandle = (instance, e) => {
  const el = e.target;
  if (el.classList.contains('bls-coverflow__dot') || el.classList.contains('bls-coverflow__item')) {
    e.preventDefault();
    e.stopPropagation();
    if (instance.data.isMoving) return false;
    if (el.classList.contains('active')) return false;

    let _index = instance.elements.dots.childs.indexOf(el);
    if (_index === -1) _index = instance.elements.items.indexOf(el);
    _goToPage(instance, _index);
  }


  return true;
};

const _slideHandle = (instance, e) => {
  e.stopPropagation();
  if (instance.data.isMoving) {
    if (instance.elements.items.indexOf(e.target) === 0 && e.propertyName === 'left') {
      setTimeout(() => {
        instance.data.isMoving = false;
        instance.elements.items.filter(item => item.classList.contains('active'))[0].classList.remove('active');
        instance.elements.dots.childs.filter(item => item.classList.contains('active'))[0].classList.remove('active');
        instance.elements.items[instance.data.current].classList.add('active');
        instance.elements.dots.childs[instance.data.current].classList.add('active');
        instance.data.pages.active = instance.data.current;
        if (typeof instance.setting.events.afterChange === 'function') instance.setting.events.afterChange(instance);
      }, 1);
    }
  }
};

const _resizeHandle = (instance) => {
  if (instance.elements.container.offsetWidth !== instance.data.width) {
    debounce(_reCalculateUI(instance));
  }
};

function _bindEvents(instance) {
  // need update layout when content fully loaded
  if (window.blsCoverflow !== undefined) {
    window.blsCoverflow.map((x) => {
      if (x.element === instance.elements.container) {
        window.removeEventListener('load', x.loadHandle);
        window.addEventListener('load', x.loadHandle);
        window.removeEventListener('resize', x.resizeHandle);
        window.addEventListener('resize', x.resizeHandle);
        instance.elements.nav.removeEventListener('click', x.navHandle);
        instance.elements.nav.addEventListener('click', x.navHandle);
        instance.elements.dots.removeEventListener('click', x.dotHandle);
        instance.elements.dots.addEventListener('click', x.dotHandle);
        instance.elements.container.removeEventListener('click', x.dotHandle, true);
        instance.elements.container.addEventListener('click', x.dotHandle, true);
        instance.elements.items.map(item => item.removeEventListener('transitionend', x.slideHandle));
        instance.elements.items.map(item => item.addEventListener('transitionend', x.slideHandle));
      }
      return x;
    });
  } else {
    window.addEventListener('load', () => _loadHandle(instance));
    window.addEventListener('resize', () => _resizeHandle(instance));
    instance.elements.nav.addEventListener('click', e => _navHandle(instance, e));
    instance.elements.dots.addEventListener('click', e => _dotHandle(instance, e));
    instance.elements.container.addEventListener('click', e => _dotHandle(instance, e));
    instance.elements.items.map(item => item.addEventListener('transitionend', e => _slideHandle(instance, e)));
  }
}

function _buildNav(instance) {
  const _instance = instance;

  const nav = document.createElement('div');
  const navPrev = document.createElement('button');
  const navNext = document.createElement('button');
  navPrev.type = 'button';
  navPrev.title = 'Previous';
  navPrev.className = 'bls-coverflow__button bls-coverflow__button--prev';

  navNext.type = 'button';
  navNext.title = 'Next';
  navNext.className = 'bls-coverflow__button bls-coverflow__button--next';

  nav.appendChild(navPrev);
  nav.appendChild(navNext);

  nav.classList.add('bls-coverflow__nav');

  _instance.elements.wrapper.appendChild(nav);
  _instance.elements.nav = nav;
  _instance.elements.navPrev = navPrev;
  _instance.elements.navNext = navNext;

  if (!_instance.setting.nav) {
    _instance.elements.nav.style.display = 'none';
  }
}

function _buildDots(instance) {
  const _instance = instance;
  const dots = document.createElement('div');
  dots.className = 'bls-coverflow__dots';

  const pages = _instance.data.total;

  [...Array(pages).keys()].map((x, index) => {
    dots.innerHTML += `<button type="button" class="bls-coverflow__dot ${index === _instance.data.pages.active ? 'active' : ''}">${x}</button>`;
    return x;
  });

  _instance.elements.wrapper.appendChild(dots);
  _instance.elements.dots = dots;
  _instance.elements.dots.childs = convertNodeListToArray(dots.children);

  _instance.data.pages.total = _instance.elements.dots.childs.length;

  if (!_instance.setting.dots) {
    _instance.elements.dots.style.display = 'none';
  }
}

function _buildUI(instance) {
  const _instance = instance;

  const wrapper = document.createElement('div');

  wrapper.classList.add('bls-coverflow');
  if (_instance.setting.class) {
    wrapper.className += ` ${_instance.setting.class}`;
  }

  _instance.elements.items.map((x) => {
    x.style.width = `${_instance.setting.width}px`;
    x.style.height = `${_instance.setting.height}px`;
    x.classList.add('bls-coverflow__item');
    return x;
  });

  _instance.elements.container.style.height = `${_instance.setting.height}px`;
  _instance.elements.wrapper = wrapper;
  _instance.elements.container.style.perspective = `${_instance.elements.container.offsetWidth / 4}px`;
  _instance.elements.items[0].classList.add('active');

  wrap(wrapper, _instance.elements.container);
  _instance.data = {
    width: _instance.elements.container.offsetWidth,
    height: _instance.elements.container.offsetHeight,
    current: 0,
    total: _instance.elements.items.length,
    canGoNext: true,
    canGoPrev: false,
    angle: 0,
    pages: {
      total: _instance.elements.items.length,
      active: 0,
    },
  };

  _buildNav(_instance);
  _buildDots(_instance);

  if (_instance.setting.type === 'circle') {
    _instance.data.itemAngle = [];
    const angleStep = maxAngle / _instance.data.total;
    _instance.elements.items.map((x) => {
      _instance.data.itemAngle.push(_instance.data.angle);
      _instance.data.angle += angleStep;
      return x;
    });
  }
  _instance.data.angle = 0;
  _calculateUI(_instance);
}

class BlsCoverflow {
  /**
   * Class constructor
   * @param {Object} setting setting for new instance plugin.
   * @param {String=} setting.selector The css selector query to get DOM elements will apply this plugin.
   * @param {Boolean=} setting.nav Default: true - Show button prev & next or NOT
   * @param {Boolean=} setting.dots Default: true - Show dots nav or NOT
   * @param {String=} setting.width Default: null = 100% - Width of container in px or percent
   * @param {Boolean=} setting.loop Default: false - Infinite loop
   * @param {Boolean=} setting.auto Default: false - Autoplay or NOT
   * @param {Number=} setting.timeShow Default: 3000 - Time (in milliseconds) pause before go to next slide (only usefull when autoplay = true)
   * @param {Number=} setting.timeSlide Default: 300 - Time (in milliseconds) for each transtion of slide
   * @param {Object=} setting.events Define callbacks for events.
   * @param {Function=} setting.events.initialized Callback will fire when 1 instance installed
   * @param {Function=} setting.events.initializedAll Callback will fire when ALL instances installed
   * @param {Function=} setting.events.beforeChange Callback will fire before coverflow move to new item(s)
   *
   *
   * @param {Function=} setting.events.afterChange Callback will fire after coverflow moved to new item(s)
   *
   *
   * @param {Function=} setting.events.resizeHeight Callback will fire after active slide item resize completed
  */
  constructor(setting) {
    const defaultSetting = {
      selector: '[data-bls-coverflow]',
      nav: true,
      dots: true,
      spacing: 0,
      auto: false,
      loop: false,
      width: 400,
      height: 400,
      type: 'linear',
      path: 'convex',
      events: {
        initialized() {},
        initializedAll() {},
        beforeChange() {},
        afterChange() {},
      },
    };

    const s = Object.assign({}, defaultSetting, setting || {});
    s.spacing = parseInt(s.spacing, 0);
    s.width = parseInt(s.width, 0);
    s.height = parseInt(s.height, 0);
    s.loop = (s.loop === '1' || s.loop === 'true' || s.loop === 1 || s.loop === true);
    s.auto = (s.auto === '1' || s.auto === 'true' || s.auto === 1 || s.auto === true);

    this.setting = s;
    this.instances = [];
    this.init(s);

    return this.instances;
  }

  init(setting) {
    const $this = this;
    const els = getSelectors(setting.selector);
    if (window.blsCoverflow === undefined) window.blsCoverflow = [];

    els.map((x) => {
      const _f = window.blsCoverflow.filter(y => y.element === x);
      if (_f.length === 0) {
        const obj = {};
        // redefine setting for each instance here
        const s = Object.assign({}, $this.setting, x.dataset || {});
        s.spacing = parseInt(s.spacing, 0);
        s.width = parseInt(s.width, 0);
        s.height = parseInt(s.height, 0);
        s.loop = (s.loop === '1' || s.loop === 'true' || s.loop === 1 || s.loop === true);
        s.auto = (s.auto === '1' || s.auto === 'true' || s.auto === 1 || s.auto === true);

        obj.setting = s;

        obj.elements = {
          container: x,
          items: convertNodeListToArray(x.children),
        };

        let initCoverflow = false;

        if (obj.elements.container.children.length > 1) {
          initCoverflow = true;
        }

        if (x.parentElement.classList.contains('bls-coverflow')) {
          initCoverflow = false;
        }

        if (initCoverflow) {
          window.blsCoverflow.push({
            element: x,
            loadHandle: _loadHandle.bind(null, obj),
            resizeHandle: _resizeHandle.bind(null, obj),
            navHandle: _navHandle.bind(null, obj),
            dotHandle: _dotHandle.bind(null, obj),
            slideHandle: _slideHandle.bind(null, obj),
          });

          obj.elements.container.classList.add('bls-coverflow__container');

          _buildUI(obj);
          _bindEvents(obj);

          $this.instances.push(obj);
          if (typeof obj.setting.events.initialized === 'function') obj.setting.events.initialized(obj);
        } else {
          x.classList.add('no-bls-coverflow');
        }
        return obj;
      }
      return x;
    });

    if (typeof $this.setting.events.initializedAll === 'function') $this.setting.events.initializedAll($this.instances);
  }
}

export default BlsCoverflow;
