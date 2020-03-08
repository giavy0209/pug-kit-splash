import BlsCalendar from '../../../../core/brayleinosplash/plugins/bls_calendar/bls_calendar';
import BlsLazy from '../../../../core/brayleinosplash/plugins/bls_lazy/bls_lazy';
import BlsCarousel from '../../../../core/brayleinosplash/plugins/bls_carousel/bls_carousel';
import {
  ajaxRequest, loadTemplate, processTemplate, convertNodeListToArray,
} from '../../../../core/brayleinosplash/utils';

app.ready(() => {
  let calendarEvent;

  const _eventClick = (e) => {
    if (e.target.classList.contains('event-item')) {
      e.preventDefault();
      e.stopPropagation();
      if (e.target.classList.contains('open')) {
        e.target.classList.remove('open');
      } else {
        e.target.classList.add('open');
      }
    }
  };

  function bindingEventAjaxContent() {
    calendarEvent.lazies = new BlsLazy({
      selector: calendarEvent.elements.table.querySelectorAll('[data-bls-lazy]'),
    });

    calendarEvent.elements.table.tableBody.removeEventListener('click', _eventClick);
    calendarEvent.elements.table.tableBody.addEventListener('click', _eventClick);
  }

  async function renderEvent(_template, _jsonData) {
    const templateDesc = await loadTemplate(_template);
    if (templateDesc !== '') {
      _jsonData.events.map((x) => {
        const _html = processTemplate(templateDesc, x);
        const _spans = convertNodeListToArray(calendarEvent.elements.table.querySelectorAll('td span'));
        _spans.map((y) => {
          if (y.dataset.date === new Date(x.startdate).toString()) {
            if (y.classList.contains('has-event')) {
              y.innerHTML += _html;
              y.classList.add('has-carousel');
            } else {
              y.innerHTML = _html;
              y.classList.add('has-event');
            }
          }
          return y;
        });
        return x;
      });

      convertNodeListToArray(calendarEvent.elements.table.querySelectorAll('.has-carousel')).map((x) => {
        x.innerHTML = `<div data-bls-carousel="data-bls-carousel">${x.innerHTML}</div>`;
        return x;
      });

      calendarEvent.carousels = new BlsCarousel({
        selector: '.has-carousel [data-bls-carousel]',
        nav: false,
        events: {
          initializedAll() {
            bindingEventAjaxContent();
          },
        },
      });

      if (!calendarEvent.carousels.length) {
        bindingEventAjaxContent();
      }
    }
  }

  function loadEvents(time) {
    const _ajaxProcess = async function _asyncProcess() {
      try {
        const content = await ajaxRequest({
          method: 'GET',
          url: `./data/data-events_${time}.json`,
        });

        await renderEvent(`${window.app.templatePath}particle/calendar_event.html`, JSON.parse(content));
        return true;
      } catch (error) {
        return error;
      }
    };
    _ajaxProcess();
  }


  const inputFull = document.querySelector('#inputCalendarFull');
  const calendarFull = new BlsCalendar({
    selector: '#calendarFull',
    events: {
      afterSelect(instance) {
        [inputFull.value] = new Date(instance.data.selected[0]).toISOString().split('T');
        calendarFull.getData();
      },
    },
  })[0];

  const calendarInputs = new BlsCalendar({
    selector: 'input[type="date"][data-bls-calendar]',
    events: {
      afterSelect() {
        // console.log(instance.data.selected[0]);
        console.log(calendarInputs.getData());
      },
    },
  })[0];

  [calendarEvent] = new BlsCalendar({
    selector: '#calendarEvent',
    weekNumber: true,
    events: {
      initialized(instance) {
        // console.log(instance);
        loadEvents(instance.data.currentMonth < 9 ? `0${instance.data.currentMonth + 1}${instance.data.currentYear}` : `${instance.data.currentMonth + 1}${instance.data.currentYear}`);
      },
      afterChangeRange(instance) {
        // console.log(instance);
        loadEvents(instance.data.currentMonth < 9 ? `0${instance.data.currentMonth + 1}${instance.data.currentYear}` : `${instance.data.currentMonth + 1}${instance.data.currentYear}`);
      },
    },
  });
});
