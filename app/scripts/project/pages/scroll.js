import BlsScroll from '../../../../core/brayleinosplash/plugins/bls_scroll/bls_scroll';
import { convertNodeListToArray, getElementStyle } from '../../../../core/brayleinosplash/utils';

app.ready(() => {
  const customScrollVertical = new BlsScroll({
    selector: '#div900',
    lineToScroll: 20,
  });

  const customNoScrollVertical = new BlsScroll({
    selector: '#divNoScroll',
    lineToScroll: 20,
  });

  [app.customScrollV] = customScrollVertical;
  if (app.customScrollV !== undefined) {
    app.customScrollV.addEventListener('blsScroll.ToTop', () => {
      console.log('top ...');
    });
    app.customScrollV.addEventListener('blsScroll.ToBottom', () => {
      console.log('bottom ...');
    });
  }

  document.querySelector('#destroy').addEventListener('click', () => {
    app.customScrollV.destroy();
  });

  const btn = document.querySelector('#btnAddData');
  const scrollData = document.querySelector('#divScrollData');

  const customScrollData = new BlsScroll({
    selector: '#divScrollData',
    lineToScroll: 20,
  });
  [app.customScrollData] = customScrollData;

  btn.addEventListener('click', (e) => {
    if (e.target === btn) {
      scrollData.innerHTML += scrollData.innerHTML;
      app.customScrollData.update();
    }
  });
});

app.load(() => {
  let w = 0;
  const _hor = document.querySelector('#div1000');
  const _both = document.querySelector('#divBoth');
  convertNodeListToArray(document.querySelector('.gallery-wrapper').querySelectorAll('.img')).map((x) => {
    w += x.offsetWidth;
    return w;
  });
  _hor.style.width = `${w + parseInt(getElementStyle(_hor, 'padding-left'), 0) + parseInt(getElementStyle(_hor, 'padding-right'), 0)}px`;
  _both.style.width = `${w + parseInt(getElementStyle(_both, 'padding-left'), 0) + parseInt(getElementStyle(_both, 'padding-right'), 0)}px`;

  const customScrollHorizontal = new BlsScroll({
    selector: '#div1000',
    lineToScroll: 20,
  });
  [app.customScrollH] = customScrollHorizontal;

  const customScroll = new BlsScroll({
    selector: '#divBoth',
    lineToScroll: 20,
  });
  [app.customScroll] = customScroll;
});
