import Hammer from 'hammerjs';

import './bls_carousel.scss';
import {
  convertNodeListToArray, wrap, prepend, debounce, unWrap, requestInterval, clearRequestInterval, getSystemInformation, getSelectors,
} from '../../utils';
import BlsLazyElement from '../bls_lazy/bls_lazy';

function _getResponsiveSetting(instance) {
  const _w = instance.info.device.type === 'pc' ? window.innerWidth : window.screen.width;
  let _rightScreen = 0;

  for (let i = 0, len = instance.setting.responsive.length; i < len; i += 1) {
    if (_w < instance.setting.responsive[i].breakpoint) {
      _rightScreen = i - 1;
      break;
    } else if (i === len - 1) {
      _rightScreen = i;
      break;
    }
  }
  const _screenSetting = Object.assign({}, instance.data.screenSetting, instance.setting.responsive[_rightScreen] || {});
  delete _screenSetting.responsive;
  instance.data.screenSetting = _screenSetting;
  instance.data.viewportSetting = _rightScreen;
  return instance;
}

function _calculateUI(instance) {
  if (instance.data.screenSetting.width) {
    instance.elements.wrapper.style.width = instance.data.screenSetting.width;
  }

  const _itemWidth = (instance.elements.wrapper.offsetWidth / instance.data.screenSetting.items);
  const _padding = instance.data.screenSetting.spacing;
  const _arr = (instance.setting.loop && !instance.setting.fade) ? instance.elements.slideItems : instance.elements.originalItems;

  _arr.map((x, index) => {
    x.style.width = `${_itemWidth}px`;
    x.style.paddingLeft = `${(_padding / 2)}px`;
    x.style.paddingRight = `${(_padding / 2)}px`;
    if (instance.setting.fade) {
      const positionItem = index % instance.setting.items;
      x.style.opacity = 0;
      x.style.transition = `opacity 500ms linear 0s`;
      x.style.position = `relative`;
      x.style.left = `${_itemWidth * (index - positionItem) * -1}px`;
      if (index < instance.setting.items) {
        x.style.opacity = 1;
      }
    }
    return x;
  });

  instance.data.position = 0;
  instance.data.unit = _itemWidth;
  instance.data.width = _itemWidth * instance.elements.slider.children.length;
  instance.data.carouselWidth = parseFloat(instance.elements.wrapper.offsetWidth);
  instance.data.availableDistance = instance.data.width - instance.data.carouselWidth;

  instance.elements.slider.style.width = `${instance.data.width}px`;

  if (instance.data.screenSetting.independHeight) {
    setTimeout(() => {
      instance.elements.slider.style.height = `${instance.data.itemActiveFirst.x.offsetHeight}px`;
    }, 300);
  }

  // Need to move to first original item after cloned
  if (instance.data.screenSetting.loop && instance.data.pages.active === 0 && !instance.setting.fade) {
    const _distance = (instance.elements.slideItems.length - instance.elements.originalItems.length) / 2 * _itemWidth * -1;
    instance.elements.slider.style.transform = `translate3d(${_distance}px,0px,0px)`;
    instance.data.position = _distance;
  }
}

function _reCalculateUI(instance) {
  if (!instance.data.screenSetting.width) {
    const _itemWidth = (instance.elements.wrapper.offsetWidth / instance.data.screenSetting.items);
    const _padding = instance.data.screenSetting.spacing;
    const _arr = (instance.setting.loop && !instance.setting.fade) ? instance.elements.slideItems : instance.elements.originalItems;

    _arr.map((x, index) => {
      x.style.width = `${_itemWidth}px`;
      x.style.paddingLeft = `${(_padding / 2)}px`;
      x.style.paddingRight = `${(_padding / 2)}px`;
      if (instance.setting.fade) {
        const positionItem = index % instance.setting.items;
        x.style.opacity = 0;
        x.style.transition = `opacity 500ms linear 0s`;
        x.style.position = `relative`;
        x.style.left = `${_itemWidth * (index - positionItem) * -1}px`;
        if (index < instance.setting.items) {
          x.style.opacity = 1;
        }
      }
      return x;
    });

    instance.data.unit = _itemWidth;
    instance.data.width = _itemWidth * instance.elements.slider.children.length;
    instance.data.carouselWidth = parseFloat(instance.elements.wrapper.offsetWidth);
    instance.data.availableDistance = instance.data.width - instance.data.carouselWidth;

    instance.elements.slider.style.width = `${instance.data.width}px`;

    if (instance.data.screenSetting.loop) {
      const _distance = (instance.elements.slideItems.length - instance.elements.originalItems.length) / 2 * _itemWidth * -1;
      instance.elements.slider.style.transform = `translate3d(${_distance}px,0px,0px)`;
      instance.data.position = _distance;
    } else {
      instance.data.position = 0;
    }

    const _p = instance.data.pages.active;
    instance.data.pages.active = 0;
    instance.data.itemInView = [];
    instance.data.itemActive = [];
    instance.data.canGoNext = true;

    instance.elements.originalItems.map((x, index) => {
      x.classList.add('bls-carousel__item');
      if (index < instance.data.screenSetting.items) {
        instance.data.itemInView.push({ x, index });
        x.classList.add('in-view');
      }
      if (index < instance.data.screenSetting.itemsMove) {
        instance.data.itemActive.push({ x, index });
        x.classList.add('active');
      }
      return x;
    });
    [instance.data.itemActiveFirst] = instance.data.itemActive;
    instance.data.itemActiveLast = instance.data.itemActive[instance.data.itemActive.length - 1];

    instance.goToPage(_p);
    if (_p === 0 && !instance.data.screenSetting.loop) {
      if (instance.data.screenSetting.independHeight) {
        setTimeout(() => {
          instance.elements.slider.style.height = `${instance.data.itemActiveFirst.x.offsetHeight}px`;
        }, 100);
      }
    }
  }
}

function _buildDots(instance, isNewSetting) {
  const _instance = instance;

  let pages = Math.ceil((_instance.elements.originalItems.length - _instance.data.screenSetting.items) / _instance.data.screenSetting.itemsMove) + 1;
  if (_instance.data.screenSetting.loop) {
    pages = Math.ceil((_instance.elements.originalItems.length) / _instance.data.screenSetting.itemsMove);
  }

  let { dots } = _instance.elements;

  if (isNewSetting === undefined) {
    dots = document.createElement('div');
    dots.className = 'bls-carousel__dots';
  } else {
    dots.innerHTML = '';
  }

  [...Array(pages).keys()].map((x, index) => {
    dots.innerHTML += `<button type="button" class="bls-carousel__dot ${index === _instance.data.pages.active ? 'active' : ''}">${x}</button>`;
    return x;
  });

  if (isNewSetting === undefined) {
    _instance.elements.wrapper.appendChild(dots);
    _instance.elements.dots = dots;
  }

  _instance.elements.dots.childs = convertNodeListToArray(dots.children);

  _instance.data.pages.total = _instance.elements.dots.childs.length;

  if (!_instance.data.screenSetting.dots) {
    _instance.elements.dots.style.display = 'none';
  }
}

function _cloneItems(instance, isNewSetting) {
  if (!instance.data.screenSetting.loop) return false;

  const _instance = instance;
  const _prevFragment = document.createDocumentFragment();
  const _nextFragment = document.createDocumentFragment();

  if (isNewSetting) {
    if (_instance.elements.slideItems) {
      _instance.elements.slideItems.map((y) => {
        if (y.classList.contains('bls-cloned')) {
          _instance.elements.slider.removeChild(y);
        }
        return y;
      });
    }
  }

  // Calculate previous objects
  let _clone;
  for (let i = 0; i < _instance.data.screenSetting.items; i += 1) {
    _clone = _instance.elements.originalItems[_instance.elements.originalItems.length - 1 - i].cloneNode(true);
    _clone.classList.add('bls-cloned');
    _prevFragment.prepend(_clone);

    _clone = _instance.elements.originalItems[i].cloneNode(true);
    _clone.classList.add('bls-cloned');
    _clone.classList.remove('in-view', 'active');
    _nextFragment.appendChild(_clone);
  }

  if (Object.prototype.hasOwnProperty.call(Document, 'prepend')) {
    _instance.elements.slider.prepend(_prevFragment);
  } else {
    prepend(_instance.elements.slider, _prevFragment);
  }
  _instance.elements.slider.appendChild(_nextFragment);

  const _cloneLazy = new BlsLazyElement({
    force: true,
    events: {
      afterLoad() {
        if (_instance.data.screenSetting.independHeight) {
          setTimeout(() => {
            _instance.elements.slider.style.height = `${_instance.data.itemActiveFirst.x.offsetHeight}px`;
            if (typeof _instance.data.screenSetting.events.resizeHeight === 'function') _instance.data.screenSetting.events.resizeHeight(_instance);
          }, 300);
        }
      },
    },
  });

  _instance.elements.cloneLazy = _cloneLazy;
  _instance.elements.slideItems = convertNodeListToArray(_instance.elements.slider.children);

  return _instance;
}

function _buildUI(instance, isNewSetting) {
  // if (!instance.setting.loop && instance.setting.items >= instance.elements.slider.children.length) return false;

  const _instance = instance;

  let { wrapper } = _instance.elements;

  if (isNewSetting === undefined) {
    wrapper = document.createElement('div');

    wrap(wrapper, _instance.elements.slider);
    wrapper.classList.add('bls-carousel');
    if (_instance.data.screenSetting.class) {
      wrapper.className += ` ${_instance.data.screenSetting.class}`;
    }
    _instance.elements.wrapper = wrapper;
  }

  if (_instance.data.screenSetting.timeSlide !== undefined) {
    _instance.elements.slider.style.transitionDuration = `${_instance.data.screenSetting.timeSlide}ms`;
  }

  const _d = Object.assign({}, _instance.data, {
    itemInView: [],
    itemActive: [],
    itemActiveFirst: null,
    itemActiveLast: null,
    itemActiveFirstRev: null,
    itemActiveLastRev: null,
    canGoNext: true,
    canGoPrev: _instance.data.screenSetting.loop,
    pages: {
      total: 1,
      active: 0,
    },
  });

  _instance.data = _d;
  // console.log(_instance.data);

  _instance.elements.originalItems.map((x, index) => {
    if (_instance.setting.fade) {
      x.style.opacity = 0;
    }
    x.classList.add('bls-carousel__item');
    if (index < _instance.data.screenSetting.items) {
      _instance.data.itemInView.push({ x, index });
      x.classList.add('in-view');
    }
    if (index < _instance.data.screenSetting.itemsMove) {
      _instance.data.itemActive.push({ x, index });
      x.classList.add('active');
      if (_instance.setting.fade) {
        x.style.opacity = 1;
      }
    }
    return x;
  });

  if (_instance.data.screenSetting.loop && !_instance.setting.fade) {
    _cloneItems(_instance, isNewSetting);
  } else if (_instance.data.screenSetting.independHeight) {
    const imgs = convertNodeListToArray(_instance.elements.wrapper.querySelectorAll('img[data-bls-lazy]'));
    imgs.map(x => x.addEventListener('load', () => {
      setTimeout(() => {
        _instance.elements.slider.style.height = `${_instance.data.itemActiveFirst.x.offsetHeight}px`;
        if (typeof _instance.data.screenSetting.events.resizeHeight === 'function') _instance.data.screenSetting.events.resizeHeight(_instance);
      }, 300);
    }));
  }

  [_instance.data.itemActiveFirst] = _instance.data.itemActive;
  _instance.data.itemActiveLast = _instance.data.itemActive[_instance.data.itemActive.length - 1];


  if (isNewSetting === undefined) {
    const nav = document.createElement('div');
    const navPrev = document.createElement('button');
    const navNext = document.createElement('button');
    navPrev.type = 'button';
    navPrev.title = 'Previous';
    navPrev.className = 'bls-carousel__button bls-carousel__button--prev';

    navNext.type = 'button';
    navNext.title = 'Next';
    navNext.className = 'bls-carousel__button bls-carousel__button--next';

    nav.appendChild(navPrev);
    nav.appendChild(navNext);

    nav.classList.add('bls-carousel__nav');

    wrapper.appendChild(nav);
    _instance.elements.nav = nav;
    _instance.elements.navPrev = navPrev;
    _instance.elements.navNext = navNext;

    _buildDots(_instance);
    _calculateUI(_instance);
  }

  if (!_instance.data.screenSetting.loop) {
    _instance.elements.navPrev.classList.add('disabled');
  }

  if (!_instance.data.screenSetting.nav) {
    _instance.elements.nav.style.display = 'none';
  }

  return true;
}

function _moveRoundSlide(instance, direction, steps) {
  const _instance = instance;
  const _direction = direction;
  const _steps = steps;

  if (typeof instance.data.screenSetting.events.beforeChange === 'function') instance.data.screenSetting.events.beforeChange(instance);
  _instance.data.isMoving = true;

  let _distance = (_steps * _instance.data.unit * _direction) + _instance.data.position;
  let _nextFirstIndex = _instance.data.itemActiveFirst.index + _direction * _steps * -1;
  let _nextLastIndex = _instance.data.itemActiveLast.index + _direction * _steps * -1;
  // let _nextFirstIndexRev = _instance.data.itemActiveFirst.index;
  // let _nextLastIndexRev = _instance.data.itemActiveLast.index;

  if (!_instance.data.screenSetting.loop) {
    if (_distance < 0) {
      _instance.data.canGoPrev = true;
      _instance.elements.navPrev.classList.remove('disabled');
    } else {
      _distance = 0;
      _instance.data.canGoPrev = false;
      _instance.elements.navPrev.classList.add('disabled');
    }
    if (_distance <= (_instance.data.availableDistance * -1)) {
      _distance = _instance.data.availableDistance * -1;
      _instance.data.canGoNext = false;
      _instance.elements.navNext.classList.add('disabled');
    } else {
      _instance.data.canGoNext = true;
      _instance.elements.navNext.classList.remove('disabled');
    }
    if (_instance.setting.fade) {
      if (_nextFirstIndex) {
        _instance.data.canGoPrev = true;
        _instance.elements.navPrev.classList.remove('disabled');
        if (_nextFirstIndex === _instance.elements.originalItems.length - 1) {
          _instance.data.canGoNext = false;
          _instance.elements.navNext.classList.add('disabled');
        }
      } else {
        _instance.data.canGoPrev = false;
        _instance.elements.navPrev.classList.add('disabled');
      }
    }
  } else if (_nextFirstIndex > _instance.elements.originalItems.length - 1) {
    _nextFirstIndex = 0;
    _nextLastIndex = _nextFirstIndex + _instance.data.screenSetting.itemsMove - 1;
  } else if (_nextFirstIndex < 0) {
    _nextFirstIndex = _instance.elements.originalItems.length - 1;
    _nextLastIndex = _nextFirstIndex;
  }

  _instance.data.itemActive.map(x => x.x.classList.remove('active'));
  _instance.data.itemInView.map(x => x.x.classList.remove('in-view'));
  _instance.data.itemActive = [];
  _instance.data.itemInView = [];
  _instance.data.itemActiveFirstRev = _instance.data.itemActiveFirst;
  _instance.data.itemActiveLastRev = _instance.data.itemActiveLast;
  _instance.elements.originalItems.map((x, index) => {
    if (_instance.setting.fade) {
      x.style.opacity = 0;
    }
    if (index === _nextFirstIndex) {
      _instance.data.itemActiveFirst = { x, index };
    }
    if (index === _nextLastIndex) {
      _instance.data.itemActiveLast = { x, index };
    }
    if (index >= _nextFirstIndex && index <= _nextLastIndex) {
      x.classList.add('active');
      _instance.data.itemActive.push({ x, index });
      if (_instance.setting.fade) {
        x.style.opacity = 1;
      }
    }

    if (index >= _nextFirstIndex && index <= ((_nextFirstIndex - 1) + _instance.data.screenSetting.items)) {
      x.classList.add('in-view');
      _instance.data.itemInView.push({ x, index });
    }
    return x;
  });
  // _instance.data.itemInView.push(_instance.data.itemActiveFirst);
  // _instance.data.itemActive.push(_instance.data.itemActiveFirst);

  _instance.elements.dots.childs[_instance.data.pages.active].classList.remove('active');
  _instance.data.pages.active += (_steps / _instance.data.screenSetting.itemsMove * -1 / _direction);

  if (_instance.data.screenSetting.loop) {
    if (_instance.data.pages.active < 0) {
      _instance.data.pages.active = _instance.data.pages.total - 1;
    }
    if (_instance.data.pages.active >= _instance.data.pages.total) {
      _instance.data.pages.active = 0;
    }
  }
  _instance.elements.dots.childs[_instance.data.pages.active].classList.add('active');

  // Animate here
  _distance = _instance.setting.fade ? 0 : _distance;
  _instance.elements.slider.style.transform = `translate3d(${_distance}px,0px,0px)`;
  _instance.data.position = _distance;
  _instance.data.direction = _direction;
}

function _moveRemainderSlide(instance, direction, steps) {
  const _instance = instance;
  const _direction = direction;
  const _steps = steps;

  if (typeof instance.data.screenSetting.events.beforeChange === 'function') instance.data.screenSetting.events.beforeChange(instance);
  _instance.data.isMoving = true;

  let _distance = (_steps * _instance.data.unit * _direction) + _instance.data.position;
  const _nextFirstIndex = _instance.data.itemActiveFirst.index + _direction * _steps * -1;
  let _nextLastIndex = _instance.data.itemActiveLast.index + _direction * _steps * -1;
  let _nextFirstIndexRev = _instance.data.itemActiveFirst.index;
  let _nextLastIndexRev = _instance.data.itemActiveLast.index;
  const _useRev = _nextLastIndexRev === _instance.elements.originalItems.length - 1;

  const _remainderNumber = _instance.elements.originalItems.length % _instance.data.screenSetting.itemsMove;

  if (!_instance.data.screenSetting.loop) {
    if (_distance < 0) {
      _instance.data.canGoPrev = true;
      _instance.elements.navPrev.classList.remove('disabled');
    } else {
      _distance = 0;
      _instance.data.canGoPrev = false;
      _instance.elements.navPrev.classList.add('disabled');
    }
    if (_distance <= (_instance.data.availableDistance * -1)) {
      _distance = _instance.data.availableDistance * -1;
      _instance.data.canGoNext = false;
      _instance.elements.navNext.classList.add('disabled');
    } else {
      _instance.data.canGoNext = true;
      _instance.elements.navNext.classList.remove('disabled');
    }
    if (_nextLastIndex >= _instance.elements.originalItems.length - 1) {
      _nextLastIndex = _instance.elements.originalItems.length - 1;
      // _nextFirstIndex = _nextLastIndex - (_instance.data.screenSetting.itemsMove - 1);
    }
    if (_useRev) {
      _distance = (_remainderNumber * _instance.data.unit * _direction) + _instance.data.position;
    }
  } else if (_instance.data.pages.active === _instance.data.pages.total - 1) {
    _distance = ((_instance.data.screenSetting.items - (_instance.data.screenSetting.items - _remainderNumber)) * _instance.data.unit * _direction) + _instance.data.position;
  }

  _instance.data.itemActive.map(x => x.x.classList.remove('active'));
  _instance.data.itemInView.map(x => x.x.classList.remove('in-view'));
  _instance.data.itemActive = [];
  _instance.data.itemInView = [];

  if (!_useRev) {
    _instance.elements.originalItems.map((x, index) => {
      if (index === _nextFirstIndex) {
        _instance.data.itemActiveFirst = { x, index };
      }
      if (index === _nextLastIndex) {
        _instance.data.itemActiveLast = { x, index };
      }
      if (index >= _nextFirstIndex && index <= _nextLastIndex) {
        x.classList.add('active');
        _instance.data.itemActive.push({ x, index });
      }

      if (index >= _nextFirstIndex && index <= ((_nextFirstIndex - 1) + _instance.data.screenSetting.items)) {
        x.classList.add('in-view');
        _instance.data.itemInView.push({ x, index });
      }
      return x;
    });
  } else {
    const _remainderItems = [];
    _instance.elements.originalItems.map((x, index) => {
      if (index >= _instance.elements.originalItems.length - _remainderNumber) {
        _remainderItems.push({ x, index });
      }
      return x;
    });

    if (_nextLastIndexRev === _remainderItems[_remainderNumber - 1].index) {
      _nextLastIndexRev = _remainderItems[0].index - 1;
      _nextFirstIndexRev = _nextLastIndexRev - (_instance.data.screenSetting.itemsMove - 1);
    }

    _instance.elements.originalItems.map((x, index) => {
      if (index === _nextFirstIndexRev) {
        _instance.data.itemActiveFirst = { x, index };
      }
      if (index === _nextLastIndexRev) {
        _instance.data.itemActiveLast = { x, index };
      }
      if (index >= _nextFirstIndexRev && index <= _nextLastIndexRev) {
        x.classList.add('active');
        _instance.data.itemActive.push({ x, index });
      }

      if (index >= _nextFirstIndexRev && index <= ((_nextFirstIndexRev - 1) + _instance.data.screenSetting.items)) {
        x.classList.add('in-view');
        _instance.data.itemInView.push({ x, index });
      }
      return x;
    });
  }

  _instance.elements.dots.childs[_instance.data.pages.active].classList.remove('active');
  _instance.data.pages.active += (_steps / _instance.data.screenSetting.itemsMove * -1 / _direction);

  if (_instance.data.screenSetting.loop) {
    if (_instance.data.pages.active < 0) {
      _instance.data.pages.active = _instance.data.pages.total - 1;
    }
    if (_instance.data.pages.active >= _instance.data.pages.total) {
      _instance.data.pages.active = 0;
    }
  }
  _instance.elements.dots.childs[_instance.data.pages.active].classList.add('active');

  // Animate here
  _instance.elements.slider.style.transform = `translate3d(${_distance}px,0px,0px)`;
  _instance.data.position = _distance;
  _instance.data.direction = _direction;
}

function _moveSlide(instance, direction, steps) {
  const _instance = instance;
  let _direction = direction;
  let _steps = steps;

  _direction = (direction === undefined || direction === null || direction >= 1) ? -1 : 1;
  if (_direction === -1 && !_instance.data.canGoNext) return false;
  if (_direction === 1 && !_instance.data.canGoPrev) return false;

  if (steps === undefined || steps === null) _steps = _instance.data.screenSetting.itemsMove;

  if (_instance.data.screenSetting.items === 1 || _instance.elements.originalItems.length % _instance.data.screenSetting.itemsMove === 0) {
    _moveRoundSlide(_instance, _direction, _steps);
  }

  if (_instance.elements.originalItems.length % _instance.data.screenSetting.itemsMove !== 0) {
    _moveRemainderSlide(_instance, _direction, _steps);
  }

  return _instance;
}

function _goToPage(instance, page) {
  if (page < 0 || page > instance.data.pages.total) return false;
  if (page === instance.data.pages.active) return false;
  const _direction = instance.data.pages.active < page ? 1 : -1;
  _moveSlide(instance, _direction, Math.abs((page * instance.data.screenSetting.itemsMove) - (instance.data.pages.active * instance.data.screenSetting.itemsMove)));
  instance.data.pages.active = page;
  return instance;
}

function _afterLoopInfinite(instance) {
  instance.data.itemActive.map(x => x.x.classList.remove('active', 'in-view'));
  instance.data.itemActive = [];
  instance.data.itemInView = [];

  let _nextFirstIndex = 0;
  if (instance.data.direction === 1) {
    _nextFirstIndex = instance.elements.originalItems.length - instance.data.screenSetting.itemsMove;
  }
  const _nextLastIndex = (_nextFirstIndex - 1) + instance.data.screenSetting.itemsMove;

  instance.elements.originalItems.map((x, index) => {
    if (index === _nextFirstIndex) {
      instance.data.itemActiveFirst = { x, index };
    }

    if (index === _nextLastIndex) {
      instance.data.itemActiveLast = { x, index };
    }

    if (index >= _nextFirstIndex && index <= _nextLastIndex) {
      x.classList.add('active');
      instance.data.itemActive.push({ x, index });
    }

    if (index >= _nextFirstIndex && index <= ((_nextFirstIndex - 1) + instance.data.screenSetting.items)) {
      x.classList.add('in-view');
      instance.data.itemInView.push({ x, index });
    }

    return x;
  });
}

function _loopRoundInfinite(instance) {
  if (instance.data.screenSetting.loop) {
    if (instance.data.pages.active === 0 && instance.data.direction === -1) {
      instance.elements.slider.classList.add('stop-transition');
      const _loopRootDistance = (instance.elements.slideItems.length - instance.elements.originalItems.length) / 2 * instance.data.unit * -1;
      instance.elements.slider.style.transform = `translate3d(${_loopRootDistance}px,0px,0px)`;
      instance.data.position = _loopRootDistance;
      setTimeout(() => instance.elements.slider.classList.remove('stop-transition'), 100);
      _afterLoopInfinite(instance);
    }

    if (instance.data.pages.active === (instance.data.pages.total - 1) && instance.data.direction === 1) {
      instance.elements.slider.classList.add('stop-transition');
      const _loopLastDistance = (instance.elements.originalItems.length) * instance.data.unit * -1;
      instance.elements.slider.style.transform = `translate3d(${_loopLastDistance}px,0px,0px)`;
      instance.data.position = _loopLastDistance;
      setTimeout(() => instance.elements.slider.classList.remove('stop-transition'), 100);
      _afterLoopInfinite(instance);
    }
    instance.data.isMoving = false;
  }
}

const _loadHandle = (instance) => {
  _calculateUI(instance);
};

const _resizeHandle = (instance) => {
  if (instance.setting.responsive !== undefined && instance.setting.responsive.length) {
    const _oldViewport = instance.data.viewportSetting;
    _getResponsiveSetting(instance);

    if (_oldViewport !== instance.data.viewportSetting) {
      if (instance.data.screenSetting.loop) _buildUI(instance, true);

      _buildDots(instance, true);

      debounce(() => {
        _reCalculateUI(instance);
      });
    }
  } else if (instance.elements.wrapper.offsetWidth !== instance.data.carouselWidth) {
    debounce(_reCalculateUI(instance));
  }
  // if (instance.setting.responsive !== undefined && instance.setting.responsive.length) {
  //   console.log(instance.setting.responsive);
  // }
};

const _navHandle = (instance, e) => {
  e.preventDefault();
  e.stopPropagation();
  if (instance.data.isMoving) return false;
  if (e.target.classList.contains('bls-carousel__button--prev')) {
    _moveSlide(instance, -1);
    return true;
  }

  if (e.target.classList.contains('bls-carousel__button--next')) {
    _moveSlide(instance, 1);
    return true;
  }

  return true;
};

const _dotHandle = (instance, e) => {
  const el = e.target;
  if (el.classList.contains('bls-carousel__dot')) {
    e.preventDefault();
    e.stopPropagation();
    if (instance.data.isMoving) return false;
    if (el.classList.contains('active')) return false;

    _goToPage(instance, instance.elements.dots.childs.indexOf(el));
  }

  return true;
};

const _slideHandle = (instance, e) => {
  e.stopPropagation();

  if (e.target === instance.elements.slider && instance.data.isMoving) {
    setTimeout(() => {
      // _loopInfinite(instance);
      if (instance.data.screenSetting.items === 1 || instance.elements.originalItems.length % instance.data.screenSetting.itemsMove === 0) _loopRoundInfinite(instance);

      if (instance.elements.originalItems.length % instance.data.screenSetting.itemsMove !== 0) _loopRoundInfinite(instance);

      if (instance.data.screenSetting.independHeight) {
        setTimeout(() => {
          instance.elements.slider.style.height = `${instance.data.itemActiveFirst.x.offsetHeight}px`;
        }, 100);
      }
      instance.data.isMoving = false;
      if (typeof instance.data.screenSetting.events.afterChange === 'function') instance.data.screenSetting.events.afterChange(instance);

      if (instance.data.screenSetting.auto) {
        if (instance.data.timeHandle) {
          if (!instance.data.canGoNext) {
            clearRequestInterval(instance.data.timeHandle);
          }
        }
      }
    }, 1);
  }
  if (instance.setting.fade) {
    instance.data.isMoving = false;
  }
};

function _bindEvents(instance) {
  // need update layout when content fully loaded
  if (window.blsCarousel !== undefined) {
    window.blsCarousel.map((x) => {
      if (x.element === instance.elements.slider) {
        window.removeEventListener('load', x.loadHandle);
        window.addEventListener('load', x.loadHandle);
        window.removeEventListener('resize', x.resizeHandle);
        window.addEventListener('resize', x.resizeHandle);
        instance.elements.nav.removeEventListener('click', x.navHandle);
        instance.elements.nav.addEventListener('click', x.navHandle);
        instance.elements.dots.removeEventListener('click', x.dotHandle);
        instance.elements.dots.addEventListener('click', x.dotHandle);
        instance.elements.slider.removeEventListener('transitionend', x.sliderHandle);
        instance.elements.slider.addEventListener('transitionend', x.sliderHandle);

        x.mc = new Hammer(instance.elements.wrapper);
        if ('ontouchstart' in document.documentElement) {
          x.mc.on('swipeleft swiperight', (e) => {
            if (e.isFinal) {
              if (e.type === 'swipeleft') {
                instance.goNext();
              } else if (e.type === 'swiperight') {
                instance.goPrevious();
              }
            }
            return true;
          });
        } else {
          x.mc.on('panleft panright', (e) => {
            if (e.isFinal) {
              if (e.type === 'panleft') {
                instance.goNext();
              } else if (e.type === 'panright') {
                instance.goPrevious();
              }
            }
            return true;
          });
        }
      }
      return x;
    });
  } else {
    window.addEventListener('load', () => _loadHandle(instance));
    window.addEventListener('resize', () => _resizeHandle(instance));
    instance.elements.nav.addEventListener('click', e => _navHandle(instance, e));
    instance.elements.dots.addEventListener('click', e => _dotHandle(instance, e));
    instance.elements.slider.addEventListener('transitionend', e => _slideHandle(instance, e));
    instance.mc = new Hammer(instance.elements.wrapper);
    if ('ontouchstart' in document.documentElement) {
      instance.mc.on('swipeleft swiperight', (e) => {
        if (e.isFinal) {
          if (e.type === 'swipeleft') {
            instance.goNext();
          } else if (e.type === 'swiperight') {
            instance.goPrevious();
          }
        }
        return true;
      });
    } else {
      instance.mc.on('panleft panright', (e) => {
        if (e.isFinal) {
          if (e.type === 'panleft') {
            instance.goNext();
          } else if (e.type === 'panright') {
            instance.goPrevious();
          }
        }
        return true;
      });
    }
  }
}

// Public method define below
function _bindPublicMethod(instance) {
  const _instance = instance;
  _instance.goNext = () => {
    _moveSlide(_instance, 1);
  };

  _instance.goPrevious = () => {
    _moveSlide(_instance, -1);
  };

  _instance.goToPage = (page) => {
    _goToPage(_instance, page);
  };

  _instance.refresh = () => {
    setTimeout(() => {
      _instance.elements.slider.style.height = `${_instance.data.itemActiveFirst.x.offsetHeight}px`;
    }, 10);
  };

  _instance.stopAuto = () => {
    if (instance.data.timeHandle) clearRequestInterval(instance.data.timeHandle);
  };

  _instance.destroy = () => {
    const _arr = [];
    window.blsCarousel.map((x) => {
      if (x.element === _instance.elements.slider) {
        window.removeEventListener('load', x.loadHandle);
        window.removeEventListener('resize', x.resizeHandle);
        instance.elements.nav.removeEventListener('click', x.navHandle);
        instance.elements.dots.removeEventListener('click', x.dotHandle);
        instance.elements.slider.removeEventListener('transitionend', x.sliderHandle);
        if (x.mc) x.mc.destroy();

        _instance.elements.wrapper.removeChild(_instance.elements.nav);
        _instance.elements.wrapper.removeChild(_instance.elements.dots);

        if (_instance.elements.slideItems) {
          _instance.elements.slideItems.map((y) => {
            if (y.classList.contains('bls-cloned')) {
              _instance.elements.slider.removeChild(y);
            }
            return y;
          });
        }

        _instance.elements.originalItems.map((z) => {
          z.classList.remove('active');
          z.classList.remove('in-view');
          z.removeAttribute('style');
          return z;
        });

        unWrap(_instance.elements.wrapper);
        _instance.elements.slider.removeAttribute('style');
      } else {
        _arr.push(x);
      }
      return x;
    });

    window.blsCarousel = _arr;
  };
}

class BlsCarousel {
  /**
   * Class constructor
   * @param {Object} setting setting for new instance plugin.
   * @param {String=} setting.selector The css selector query to get DOM elements will apply this plugin.
   * @param {Boolean=} setting.nav Default: true - Show button prev & next or NOT
   * @param {Boolean=} setting.806s Default: true - Show dots nav or NOT
   * @param {String=} setting.width Default: null = 100% - Width of slider in px or percent
   * @param {Number=} setting.items Default: 1 - Number of item(s) display in view
   * @param {Number=} setting.itemsMove Default: 1 - Number of item(s) move to view each slide
   * @param {Number=} setting.spacing Default: 0 - Spacing between 2 items.
   * @param {Boolean=} setting.loop Default: false - Infinite loop
   * @param {Boolean=} setting.auto Default: false - Autoplay or NOT
   * @param {Number=} setting.timeShow Default: 3000 - Time (in milliseconds) pause before go to next slide (only usefull when autoplay = true)
   * @param {Number=} setting.timeSlide Default: 300 - Time (in milliseconds) for each transtion of slide
   * @param {Object=} setting.events Define callbacks for events.
   * @param {Function=} setting.events.initialized Callback will fire when 1 instance installed
   * @param {Function=} setting.events.initializedAll Callback will fire when ALL instances installed
   * @param {Function=} setting.events.beforeChange Callback will fire before carousel move to new item(s)
   * @param {Function=} setting.events.afterChange Callback will fire after carousel moved to new item(s)
   * @param {Function=} setting.events.resizeHeight Callback will fire after active slide item resize completed
  */
  constructor(setting) {
    const defaultSetting = {
      selector: '[data-bls-carousel]',
      nav: true,
      dots: true,
      items: 1,
      itemsMove: 1,
      spacing: 0,
      auto: false,
      loop: false,
      forceLoop: false,
      timeShow: 3000,
      // timeSlide: 300,
      fade: false,
      independHeight: false,
      // responsive: [],
      events: {
        initialized() { },
        initializedAll() { },
        beforeChange() { },
        afterChange() { },
        resizeHeight() { },
      },
    };

    const s = Object.assign({}, defaultSetting, setting || {});
    s.items = parseInt(s.items, 0);
    s.itemsMove = parseInt(s.itemsMove, 0);
    s.spacing = parseInt(s.spacing, 0);
    s.timeShow = parseInt(s.timeShow, 0);
    s.timeSlide = parseInt(s.timeSlide || 300, 0);
    if (s.itemsMove > s.items) s.itemsMove = s.items;
    s.forceLoop = (s.forceLoop === '1' || s.forceLoop === 'true' || s.forceLoop === 1 || s.forceLoop === true);
    s.loop = (s.loop === '1' || s.loop === 'true' || s.loop === 1 || s.loop === true);
    s.auto = (s.auto === '1' || s.auto === 'true' || s.auto === 1 || s.auto === true);
    s.fade = (s.fade === '1' || s.fade === 'true' || s.fade === 1 || s.fade === true);

    this.setting = s;
    this.instances = [];
    this.init(s);

    return this.instances;
  }

  init(setting) {
    const $this = this;
    const els = getSelectors(setting.selector);
    if (window.blsCarousel === undefined) window.blsCarousel = [];

    const info = getSystemInformation();
    if (info.device.type === undefined) info.device.type = 'pc';
    if (info.device.model === undefined) info.device.model = 'desktop';
    if (info.device.vendor === undefined) info.device.vendor = 'desktop';

    els.map((x) => {
      const _f = window.blsCarousel.filter(y => y.element === x);
      if (_f.length === 0) {
        const obj = {};
        // redefine setting for each instance here
        const s = Object.assign({}, $this.setting, x.dataset || {});
        s.items = parseInt(s.items, 0);
        s.itemsMove = parseInt(s.itemsMove, 0);
        s.spacing = parseInt(s.spacing, 0);
        s.timeShow = parseInt(s.timeShow, 0);
        s.timeSlide = parseInt(s.timeSlide, 0);
        s.forceLoop = (s.forceLoop === '1' || s.forceLoop === 'true' || s.forceLoop === 1 || s.forceLoop === true);
        s.loop = (s.loop === '1' || s.loop === 'true' || s.loop === 1 || s.loop === true);
        s.auto = (s.auto === '1' || s.auto === 'true' || s.auto === 1 || s.auto === true);
        s.fade = (s.fade === '1' || s.fade === 'true' || s.fade === 1 || s.fade === true);

        obj.setting = s;
        obj.info = info;
        obj.data = {};
        obj.data.screenSetting = s;
        obj.data.viewportSetting = 0;

        obj.elements = {
          slider: x,
          originalItems: convertNodeListToArray(x.children),
        };

        let initCarousel = false;

        if (obj.setting.forceLoop) {
          if (obj.setting.items <= obj.elements.slider.children.length) {
            initCarousel = true;
          }
        } else if (obj.setting.items < obj.elements.slider.children.length) {
          initCarousel = true;
        }

        if (x.parentElement.classList.contains('bls-carousel')) {
          initCarousel = false;
        }

        if (initCarousel) {
          window.blsCarousel.push({
            element: x,
            loadHandle: _loadHandle.bind(null, obj),
            resizeHandle: _resizeHandle.bind(null, obj),
            navHandle: _navHandle.bind(null, obj),
            dotHandle: _dotHandle.bind(null, obj),
            sliderHandle: _slideHandle.bind(null, obj),
          });

          obj.elements.slider.classList.add('bls-carousel__slider');

          if (obj.setting.responsive) {
            obj.setting.responsive.sort((a, b) => a.breakpoint - b.breakpoint);
            _getResponsiveSetting(obj);
          }

          _buildUI(obj);
          _bindEvents(obj);
          _bindPublicMethod(obj);

          $this.instances.push(obj);
          if (typeof obj.data.screenSetting.events.initialized === 'function') obj.data.screenSetting.events.initialized(obj);
          if (obj.data.screenSetting.auto) {
            setTimeout(() => {
              obj.data.timeHandle = requestInterval(() => {
                obj.goNext();
              }, obj.data.screenSetting.timeShow);
            }, obj.data.screenSetting.timeShow);
          }
        } else {
          x.classList.add('no-bls-carousel');
        }
        return obj;
      }
      return x;
    });

    if (typeof $this.setting.events.initializedAll === 'function') $this.setting.events.initializedAll($this.instances);
  }
}

export default BlsCarousel;
