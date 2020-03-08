import BlsProgress from '../../../../core/brayleinosplash/plugins/bls_progress/bls_progress';

app.ready(() => {
  const progressOne = new BlsProgress()[0];

  const inputOne = document.querySelector('#demoOne');
  inputOne.value = progressOne.value();
  inputOne.addEventListener('input', (e) => {
    progressOne.update(e.target.value);
  });
});
