import './bls_calendar.scss';
import {
  convertNodeListToArray, wrap, getAllDatesInMonth, isToday, unWrap, insertAfter, getSelectors,
} from '../../utils';
import BlsDropdown from '../bls_dropdown/bls_dropdown';

import * as en from './bls-calendar__i18n_en.json';

function _drawUI(instance) {
  const _instance = instance;

  const _nav = document.createElement('nav');
  const _table = document.createElement('table');
  const _tableHead = document.createElement('thead');
  const _tableBody = document.createElement('tbody');
  const _tableMonth = document.createElement('table');
  const _tableYear = document.createElement('ul');

  _tableMonth.className = 'bls-calendar__table bls-calendar__table--month';
  _tableYear.className = 'bls-calendar__table bls-calendar__table--year';

  _nav.className = 'bls-calendar__nav';
  _nav.innerHTML = `<button class="bls-calendar__button bls-calendar__button--prev"></button><div class="bls-calendar__heading-title">${_instance.data.texts.months[instance.data.currentMonth][instance.data.currentMonth].full}</div><button class="bls-calendar__button bls-calendar__button--next"></button>`;

  _table.className = 'bls-calendar__table bls-calendar__table--date';
  _table.appendChild(_tableHead);
  _table.appendChild(_tableBody);

  // Draw days row
  const _dayLabelCells = [0, 1, 2, 3, 4, 5, 6];
  let _row = '<tr>';
  _dayLabelCells.map((x) => {
    _row += `<th><span data-day="${x}">${_instance.data.texts.days[x][x].short}</span></th>`;
    return x;
  });
  _row += '</tr>';
  _tableHead.innerHTML = _row;

  instance.elements.wrapper.appendChild(_nav);
  instance.elements.wrapper.appendChild(_table);
  instance.elements.wrapper.appendChild(_tableMonth);
  instance.elements.wrapper.appendChild(_tableYear);

  instance.elements.nav = _nav;
  instance.elements.nav.prev = _nav.querySelector('.bls-calendar__button--prev');
  instance.elements.nav.next = _nav.querySelector('.bls-calendar__button--next');
  instance.elements.nav.heading = _nav.querySelector('.bls-calendar__heading-title');
  instance.elements.table = _table;
  instance.elements.table.tableHead = _tableHead;
  instance.elements.table.tableBody = _tableBody;
  instance.elements.tableMonth = _tableMonth;
  instance.elements.tableYear = _tableYear;
}

function _buildUIYear(instance) {
  // console.log(instance.data.currentYear);
  const _min = instance.data.currentYear - 50;
  const _max = instance.data.currentYear + 50;
  let _row = '';
  let _top = 0;
  for (let i = _min; i < _max; i += 1) {
    _row += `<li><span class='${i === instance.data.currentYear ? 'current-year' : ''}' data-year=${i}>${i}</span></li>`;
    if (i === instance.data.currentYear) _top = (i - _min);
  }
  instance.elements.tableYear.innerHTML = _row;
  instance.elements.tableYear.scrollTo(0, instance.elements.tableYear.children[_top].offsetTop);
}

function _buildUIMonth(instance) {
  // console.log(instance.data.currentDateTime.getMonth());
  let _row = '<tr>';
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((x, index) => {
    _row += `<td><span class='${x === instance.data.currentMonth ? 'current-month' : ''}' data-month=${x}>${instance.data.texts.months[x][x].short}</span></td>`;
    if (index % 4 === 3 && index < 10) {
      _row += '</tr><tr>';
    }
    return x;
  });
  instance.elements.tableMonth.innerHTML = _row;
}

function _buildUIDate(instance) {
  // console.log(instance.data.currentDateTime.getDate());
  instance.data.monthDates = getAllDatesInMonth(instance.data.currentYear, instance.data.currentMonth);
  const _startDay = instance.data.monthDates[0].getDay();
  const _endDay = instance.data.monthDates[instance.data.monthDates.length - 1].getDay();
  // const _addDays = _startDay + (6 - _endDay);
  const _arrDays = [];
  for (let i = 0; i < _startDay; i += 1) {
    const _d = new Date(instance.data.monthDates[0]);
    _d.setDate(instance.data.monthDates[0].getDate() - (_startDay - i));
    _arrDays.push({ fulldate: _d, date: _d.getDate(), class: 'prev-month' });
  }
  instance.data.monthDates.map((x) => {
    let _c = 'current-month';

    if (isToday(x)) _c += ' current-day';

    return _arrDays.push({ fulldate: x, date: x.getDate(), class: _c });
  });
  for (let i = _endDay + 1; i < 7; i += 1) {
    const _d = new Date(instance.data.monthDates[instance.data.monthDates.length - 1]);
    _d.setDate(instance.data.monthDates[instance.data.monthDates.length - 1].getDate() + (i - _endDay));
    _arrDays.push({ fulldate: _d, date: _d.getDate(), class: 'next-month' });
  }

  let _row = '<tr>';
  _arrDays.map((x, index) => {
    _row += `<td ${index === 0 || index % 7 === 0
      ? 'class=first-column'
      : ''}><span data-day=${x
      .fulldate
      .getDay()} data-date="${x
      .fulldate}" data-text="${x
      .date}" class="${x
      .class}">${x
      .date}</span>${instance.setting.weekNumber && (index === 0 || index % 7 === 0)
      ? `<week>${new Date(x.fulldate).getWeek()}</week>`
      : ''}</td>`;
    if (index % 7 === 6 && index !== 0 && index < _arrDays.length - 1) {
      _row += '</tr><tr>';
    }
    return x;
  });
  _row += '</tr>';
  instance.elements.table.tableBody.innerHTML = _row;
}

function _buildUI(instance) {
  const _instance = instance;

  // TODO Load language
  _instance.data.texts = en.default;

  const wrapper = document.createElement('div');

  wrapper.classList.add('bls-calendar');
  wrapper.classList.add('bls-calendar--date-view');
  if (_instance.setting.class && _instance.setting.class !== '') {
    wrapper.classList.add(_instance.setting.class);
  }

  _instance.elements.wrapper = wrapper;

  _instance.data.currentDateTime = new Date();
  _instance.data.currentYear = _instance.data.currentDateTime.getFullYear();
  _instance.data.currentMonth = _instance.data.currentDateTime.getMonth();
  _instance.data.currentDate = _instance.data.currentDateTime.getDate();
  _instance.data.view = 0;

  if (_instance.elements.origin.nodeName !== 'INPUT') {
    wrapper.className += ` ${_instance.elements.origin.className}`;
    _instance.elements.origin.classList.add('invisible');
    wrap(wrapper, _instance.elements.origin);
  } else {
    wrapper.className += ` ${_instance.elements.origin.className.replace('form-control', '')}`;

    const _modal = document.createElement('div');
    _modal.classList.add('bls-dropdown__menu');
    insertAfter(_instance.elements.origin, wrapper);
    wrap(_modal, wrapper);
    _instance.elements.origin.classList.add('bls-calendar__input');

    const [_dropdown] = new BlsDropdown({
      selector: _instance.elements.origin,
      events: {
        initialized(_modalInstance) {
          _instance.elements.origin.type = 'text';
          if (_instance.elements.origin.pattern === undefined) _instance.elements.origin.pattern = _instance.setting.pattern;
          _modalInstance.elements.wrapper.classList.add('bls-calendar__input-wrapper');
        },
      },
    });
    instance.elements.dropdown = _dropdown;
  }

  _drawUI(instance);

  _buildUIDate(_instance);
  _buildUIMonth(_instance);
  _buildUIYear(_instance);
}

function updateLayout(instance) {
  instance.elements.wrapper.classList.remove('bls-calendar--date-view');
  instance.elements.wrapper.classList.remove('bls-calendar--month-view');
  instance.elements.wrapper.classList.remove('bls-calendar--year-view');
  if (instance.data.view === 0) {
    instance.elements.nav.heading.innerText = instance.data.texts.months[instance.data.currentMonth][instance.data.currentMonth].full;
    instance.elements.wrapper.classList.add('bls-calendar--date-view');
  } else if (instance.data.view === 1) {
    instance.elements.nav.heading.innerText = instance.data.currentYear;
    instance.elements.wrapper.classList.add('bls-calendar--month-view');
  } else {
    instance.elements.wrapper.classList.add('bls-calendar--year-view');
  }

  _buildUIDate(instance);
  _buildUIMonth(instance);
  _buildUIYear(instance);
}

function selectDate(instance, date, element) {
  const i = instance.data.selected.indexOf(date);
  if (i !== -1) {
    if (typeof instance.setting.events.beforeUnSelect === 'function') instance.setting.events.beforeUnSelect(instance);
    if (!instance.setting.multi) {
      instance.data.selected = [];
    } else {
      instance.data.selected.slice(i, 1);
    }
    if (element !== undefined) element.classList.remove('selected-day');
    if (typeof instance.setting.events.afterUnSelect === 'function') instance.setting.events.afterUnSelect(instance);
  } else {
    if (typeof instance.setting.events.beforeSelect === 'function') instance.setting.events.beforeSelect(instance);
    if (!instance.setting.multi) {
      instance.data.selected = [];
      convertNodeListToArray(instance.elements.table.tableBody.querySelectorAll('.selected-day')).map(x => x.classList.remove('selected-day'));
    }
    instance.data.selected.push(date);

    const el = instance.elements.table.tableBody.querySelector(`[data-date="${date}"]`);
    if (el) el.classList.add('selected-day');
    if (instance.elements.origin.nodeName === 'INPUT') {
      const d = new Date(date);
      [instance.elements.origin.value] = d.toISOString().split('T');
      instance.elements.dropdown.close();
    }
    if (typeof instance.setting.events.afterSelect === 'function') instance.setting.events.afterSelect(instance);
  }
}

const _toggleSelectDay = (instance, e) => {
  e.stopPropagation();
  e.preventDefault();
  if (e.target.dataset !== undefined && e.target.dataset !== null) {
    selectDate(instance, e.target.dataset.date, e.target);
  }
};

const _toggleSelectMonth = (instance, e) => {
  if (e.target.dataset !== undefined) {
    e.stopPropagation();
    e.preventDefault();

    instance.data.currentMonth = parseInt(e.target.dataset.month, 0);
    instance.data.view = 0;

    updateLayout(instance);
  }
};

const _toggleSelectYear = (instance, e) => {
  if (e.target.dataset !== undefined) {
    e.stopPropagation();
    e.preventDefault();

    instance.data.currentYear = parseInt(e.target.dataset.year, 0);
    instance.data.view = 1;

    updateLayout(instance);
  }
};

const _switchTimeRange = (instance, e) => {
  if (e.target.classList.contains('bls-calendar__button')) {
    e.stopPropagation();
    e.preventDefault();
    if (e.target.classList.contains('bls-calendar__button--prev')) {
      if (typeof instance.setting.events.beforeChangeRange === 'function') instance.setting.events.beforeChangeRange(instance);
      if (instance.data.view === 0) {
        if (instance.data.currentMonth > 0) {
          instance.data.currentMonth -= 1;
        } else {
          instance.data.currentMonth = 11;
          instance.data.currentYear -= 1;
        }
      } else if (instance.data.view === 1) {
        instance.data.currentYear -= 1;
      }
    }

    if (e.target.classList.contains('bls-calendar__button--next')) {
      if (typeof instance.setting.events.beforeChangeRange === 'function') instance.setting.events.beforeChangeRange(instance);
      if (instance.data.view === 0) {
        if (instance.data.currentMonth < 11) {
          instance.data.currentMonth += 1;
        } else {
          instance.data.currentMonth = 0;
          instance.data.currentYear += 1;
        }
      } else if (instance.data.view === 1) {
        instance.data.currentYear += 1;
      }
    }

    updateLayout(instance);
    if (typeof instance.setting.events.afterChangeRange === 'function') instance.setting.events.afterChangeRange(instance);
  }
};

const _switchView = (instance, e) => {
  if (e.target.classList.contains('bls-calendar__heading-title')) {
    e.stopPropagation();
    e.preventDefault();
    if (instance.data.view >= 2) {
      instance.data.view = 0;
    } else {
      instance.data.view += 1;
    }
    updateLayout(instance);
  }
};

function _binddEvents(instance) {
  if (window.blsCalendar !== undefined) {
    window.blsCalendar.map((x) => {
      if (x.element === instance.elements.origin) {
        instance.elements.table.tableBody.removeEventListener('click', x.toggleSelectDay);
        instance.elements.table.tableBody.addEventListener('click', x.toggleSelectDay);
        instance.elements.nav.removeEventListener('click', x.switchTimeRange);
        instance.elements.nav.addEventListener('click', x.switchTimeRange);
        instance.elements.nav.heading.removeEventListener('click', x.switchView);
        instance.elements.nav.heading.addEventListener('click', x.switchView);
        instance.elements.tableMonth.removeEventListener('click', x.toggleSelectMonth);
        instance.elements.tableMonth.addEventListener('click', x.toggleSelectMonth);
        instance.elements.tableYear.removeEventListener('click', x.toggleSelectYear);
        instance.elements.tableYear.addEventListener('click', x.toggleSelectYear);
      }
      return x;
    });
  } else {
    instance.elements.table.tableBody.addEventListener('click', e => _toggleSelectDay(instance, e));
    instance.elements.nav.addEventListener('click', e => _switchTimeRange(instance, e));
    instance.elements.nav.heading.addEventListener('click', e => _switchView(instance, e));
    instance.elements.tableMonth.addEventListener('click', e => _toggleSelectMonth(instance, e));
    instance.elements.tableYear.addEventListener('click', e => _toggleSelectYear(instance, e));
  }
}

// Public method define below
function _bindPublicMethod(instance) {
  const _instance = instance;
  _instance.getValue = () => _instance.data.selected;

  _instance.setValue = (date) => {
    selectDate(instance, date);
  };

  _instance.getData = () => _instance.data;

  _instance.destroy = () => {
    const _arr = [];
    window.blsCalendar.map((x) => {
      if (x.element === _instance.elements.origin) {
        instance.elements.table.tableBody.removeEventListener('click', x.toggleSelectDay);
        instance.elements.nav.removeEventListener('click', x.switchTimeRange);
        instance.elements.nav.heading.removeEventListener('click', x.switchView);
        instance.elements.tableMonth.removeEventListener('click', x.toggleSelectMonth);
        instance.elements.tableYear.removeEventListener('click', x.toggleSelectYear);

        instance.elements.wrapper.removeChild(instance.elements.table);
        instance.elements.wrapper.removeChild(instance.elements.tableMonth);
        instance.elements.wrapper.removeChild(instance.elements.nav);
        unWrap(instance.elements.wrapper);
        instance.elements.origin.classList.remove('invisible');
      } else {
        _arr.push(x);
      }
      return x;
    });

    window.blsCalendar = _arr;
  };
}

class BlsCalendar {
  /**
   * Class constructor
   * @param {Object} setting Setting for new instance plugin.
   * @param {String} setting.selector The css selector query to get DOM elements will apply this plugin.
   * @param {Object} weekNumber Display week number or not.
   * @param {Object} setting.events Define callbacks for events.
   * @param {Function} setting.events.initialized Callback will fire when 1 instance installed
   * @param {Function} setting.events.initializedAll Callback will fire when ALL instances installed
   * @param {Function} setting.events.beforeOpen Callback will fire before collapse instance open
   * @param {Function} setting.events.afterOpen Callback will fire before collapse instance open
   * @param {Function} setting.events.beforeClose Callback will fire before collapse instance open
   * @param {Function} setting.events.afterClose Callback will fire before collapse instance open
  */
  constructor(setting) {
    const defaultSetting = {
      selector: '[data-bls-calendar]',
      language: 'en',
      multi: false,
      min: null,
      max: null,
      weekNumber: false,
      pattern: '\\d{4}-\\d{2}-\\d{2}',
      events: {
        initialized() {},
        initializedAll() {},
        beforeOpen() {},
        afterOpen() {},
        beforeClose() {},
        afterClose() {},
        beforeSelect() {},
        afterSelect() {},
        beforeUnSelect() {},
        afterUnSelect() {},
        beforeChangeRange() {},
        afterChangeRange() {},
      },
    };

    const s = Object.assign({}, defaultSetting, setting || {});
    s.multi = (s.multi === '1' || s.multi === 'true' || s.multi === 1 || s.multi === true);
    this.setting = s;
    this.instances = [];
    this.init(s);

    return this.instances;
  }

  init(setting) {
    const $this = this;
    const els = getSelectors(setting.selector);
    if (window.blsCalendar === undefined) window.blsCalendar = [];

    els.map((x) => {
      const _f = window.blsCalendar.filter(y => y.element === x);
      if (_f.length === 0) {
        const obj = {};
        const s = Object.assign({}, $this.setting, x.dataset || {});
        s.multi = (s.multi === '1' || s.multi === 'true' || s.multi === 1 || s.multi === true);
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

        window.blsCalendar.push({
          element: x,
          toggleSelectDay: _toggleSelectDay.bind(null, obj),
          toggleSelectMonth: _toggleSelectMonth.bind(null, obj),
          toggleSelectYear: _toggleSelectYear.bind(null, obj),
          switchTimeRange: _switchTimeRange.bind(null, obj),
          switchView: _switchView.bind(null, obj),
        });

        _buildUI(obj);
        _binddEvents(obj);
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

export default BlsCalendar;
