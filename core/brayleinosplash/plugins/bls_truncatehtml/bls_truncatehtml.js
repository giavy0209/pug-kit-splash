import '../../polyfill';
import { convertNodeListToArray } from '../../utils';
import './bls_truncatehtml.scss';

const regexCount = /<\S[^>]*>?/ig,
  regexAllClosedTag = /<\/\S*[^>]*>?$/g;
// regexAllClosedTag = /<\/[^>]>*>$|<\/[^>]*>|<\/[^>]>*>$|<\/[^>]*><\/[^>]*>.*/g;
// regexFirstTags = /<\w*[^>]*>[<[\w*[^>]*>|<\w*[^>]*>/,
// regexSpace = /\s+/gm;

const _clickShowMoreText = (instance, e) => {
  e.stopPropagation();
  e.preventDefault();

  const btnView = instance.elements.node.querySelector('.bls-view-more');
  const originalHtml = instance.elements.node.getAttribute('data-html-original');

  if (btnView.classList.contains('shown')) {
    _truncate(instance, instance.setting);
    if (typeof instance.setting.events.afterViewLess === 'function') instance.setting.events.afterViewLess(instance);
  } else {
    instance.elements.node.innerHTML = originalHtml;
    if (instance.elements.node.children.length) {
      instance.elements.node.children[0].appendChild(_buidViewMore(instance, true));
    }
    if (typeof instance.setting.events.afterViewMore === 'function') instance.setting.events.afterViewMore(instance);
  }
  _bindClickEvent(instance);
}

const _clickHandle = (instance, e) => {
  _clickShowMoreText(instance, e);
}

function _originalElement(instance) {
  const html = instance.data.original;
  instance.elements.node.setAttribute('data-html-original', html);
}

function _buidViewMore(instance, isShown) {
  if (!instance.setting.viewMore) return;
  const span = document.createElement('span');
  span.classList.add('bls-view-more');
  span.classList.add(isShown ? 'shown' : 'less');
  span.innerText = ` ${instance.setting.viewMore.split('|')[isShown ? 1 : 0]}`;
  return span;
}

function _buildDelimiter(instance) {
  if (!instance.setting.delimiter) return;
  const span = document.createElement('span');
  span.classList.add('bls-delimiter');
  span.innerText = `${instance.setting.delimiter}`;
  return span;
}

function _setTextOpacity(l, span) {
  const arr = l.split('');
  const opacity = 1;
  const opacityDescrease = opacity / l.length;
  let reduce = 0;

  arr.forEach(el => {

    const goSpan = document.createElement('span');
    goSpan.classList.add('opa');
    goSpan.innerText = el;
    goSpan.style.opacity = opacity - reduce;

    reduce += opacityDescrease;
    span.appendChild(goSpan);
  });

}

function _setColor(instance, span) {
  setTimeout(() => {
    const color = getComputedStyle(instance.elements.node.children[0]).color;
    span.style.backgroundImage = `-webkit-linear-gradient(to left, transparent, ${color})`;
    span.style.backgroundImage = `-ms-linear-gradient(to left, transparent, ${color})`;
    span.style.backgroundImage = `-o-linear-gradient(to left, transparent, ${color})`;
    span.style.backgroundImage = `-moz-linear-gradient(to left, transparent, ${color})`;
    span.style.backgroundImage = `linear-gradient(to left, transparent, ${color})`;
    return span;
  }, 10);

}

function _buildTextFade(instance, setting) {
  if (!instance.setting.textFade) return;

  let html = _subString(instance, setting.length),
    htmlPlus = _subString(instance, parseInt(setting.length, 10) + parseInt(setting.textFade, 10)),
    l = '', lastTag = '';

  if (html.match(regexAllClosedTag)) {
    const arrLastTags = html.match(regexAllClosedTag);
    arrLastTags.forEach(i => {
      lastTag += i;
    });
  }
  if (htmlPlus.match(regexCount) === null) {
    l = htmlPlus.substring(html.length, htmlPlus.length);
  } else {
    l = htmlPlus.substring(html.length - lastTag.length, htmlPlus.length - lastTag.length);
    if (l.match(regexCount) !== null) {
      const arrTotalTags = l.match(regexCount);
      let total = '';
      arrTotalTags.forEach(i => {
        total += i;
      });
      l = htmlPlus.substring(html.length - lastTag.length, htmlPlus.length - lastTag.length + total.length);
      l = l.replace(regexCount, '');
    }
  }

  const span = document.createElement('span');
  span.classList.add('bls-text-fade');

  if (document.documentElement.classList.contains('ie')) {
    _setTextOpacity(l, span);
  } else {
    span.innerText = `${l}`;
    _setColor(instance, span);
  }
  return span;
}

function _truncate(instance, setting) {
  if (instance.setting.length >= instance.data.original.length) return;
  let html = _subString(instance, setting.length), viewMore = '', textFade = '';

  // remove all IMG tags
  html = html.replace(/<im[^>]*>?/gm, '');
  // remove all BR tags
  html = html.replace(/<\/br>/gm, '');
  // if (html.match(regexAllClosedTag)) {
  //   lastTags = html.match(regexAllClosedTag)[0];
  // }
  // html = html.replace(regexAllClosedTag, '');

  // html = `${html}${lastTags}`;

  instance.elements.node.innerHTML = html;

  if (instance.setting.textFade) {
    textFade = _buildTextFade(instance, setting);
  } else {
    instance.elements.node.children[0].appendChild(_buildDelimiter(instance));
  }

  viewMore = _buidViewMore(instance, false);

  if (textFade) {
    instance.elements.node.children[0].appendChild(textFade);
  }
  if (viewMore) {
    instance.elements.node.children[0].appendChild(viewMore);

  }
}

function _subString(instance, number) {
  const regex = /<([^>\s]*)[^>]*>/g;
  let arr = [], lastIndex = 0, arrHtml, result = '',
    html = instance.data.original;

  while ((arrHtml = regex.exec(html)) && number) {
    const temp = html.substring(lastIndex, arrHtml.index).substr(0, number);
    result += temp;
    number -= temp.length;
    lastIndex = regex.lastIndex;
    if (number) {
      result += arrHtml[0];
      if (arrHtml[1].indexOf('/') === 0) {
        arr.pop();
      } else if (arrHtml[1].lastIndexOf('/') !== arrHtml[1].length - 1) {
        arr.push(arrHtml[1]);
      }
    }
  }
  result += html.substr(lastIndex, number);
  while (arr.length) {
    result += '</' + arr.pop() + '>';
  }

  return result;
}

function _initData(instance) {
  const _instance = instance;
  _instance.data = {
    original: _instance.elements.node.children[0].outerHTML,
  };
  _originalElement(instance);
  _truncate(instance, instance.setting);
}

function _bindPublicMethod(instance) {
  instance.destroy = () => {
    const originalHtml = instance.elements.node.getAttribute('data-html-original');
    instance.elements.node.innerHTML = originalHtml;
    instance.elements.node.removeAttribute('data-html-original');
  }
  // instance.update = () => {
  //   if (instance.elements.target.children.length) {
  //     // console.log(instance.elements.target.children[0].innerText);
  //     [instance.elements.target] = instance.elements.target.children;
  //   }
  //   _initData(instance);
  // };
}

function _bindClickEvent(instance) {
  if (instance.setting.viewMore) {
    instance.elements.node.querySelector('.bls-view-more').addEventListener('click', (e) => {
      _clickHandle(instance, e);
    });
  }
}

class BlsDataTruncate {
  /**
   * Class constructor
   * @param {Object} setting setting for new instance plugin.
   * @param {String} setting.selector The css selector query to get DOM elements will apply this plugin.
   * @param {Object} setting.events Define callbacks for events.
   * @param {Function} setting.events.initialized Callback will fire when 1 instance installed
   * @param {Function} setting.events.initializedAll Callback will fire when ALL instances installed
   * @param {Function} setting.events.afterViewMore Callback will fire after view more
   * @param {Function} setting.events.afterViewLess Callback will fire after view less
  */
  constructor(setting) {
    const defaultSetting = {
      selector: '[data-bls-truncatehtml]',
      delimiter: '...',
      viewMore: false,
      textFade: 0,
      events: {
        initialized() { },
        initializedAll() { },
        afterViewMore() { },
        afterViewLess() { },
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
    const els = convertNodeListToArray(document.querySelectorAll(setting.selector));

    els.map((x) => {
      const obj = {};
      const s = Object.assign({}, $this.setting, x.dataset || {});
      obj.setting = s;

      obj.setting.length = parseFloat(obj.setting.length);

      obj.elements = {
        // target: x.children.length > 0 ? x.children[0] : x,
        node: x
      };

      _initData(obj);
      _bindPublicMethod(obj);
      _bindClickEvent(obj);

      $this.instances.push(obj);

      if (typeof obj.setting.events.initialized === 'function') obj.setting.events.initialized(obj);

      return obj;
    });

    if (typeof $this.setting.events.initializedAll === 'function') $this.setting.events.initializedAll(els);
  }
}

export default BlsDataTruncate;
