import BlsModal from '../../../../core/brayleinosplash/plugins/bls_modal/bls_modal';

app.ready(() => {
  const modals = new BlsModal({
    events: {
      afterContentLoadFail(instance, error) {
        console.log(error);
      },
    },
  });
  document.querySelector('#destroy').addEventListener('click', () => {
    modals[3].destroy();
  });
});
