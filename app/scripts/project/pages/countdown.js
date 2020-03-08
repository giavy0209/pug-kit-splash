import BlsCountdown from '../../../../core/brayleinosplash/plugins/bls_countdown/bls_countdown';

app.ready(() => {

  const _timer = document.querySelector('[data-bls-countdown]');
  _timer.dataset.target = `01/01/${new Date().getFullYear() + 1} 00:00:00`;
  const [_countdown] = new BlsCountdown({
    selector: _timer,
  });
});
