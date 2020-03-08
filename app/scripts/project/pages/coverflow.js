import BlsCoverflow from '../../../../core/brayleinosplash/plugins/bls_coverflow/bls_coverflow';

app.load(() => {
  const coverflows = new BlsCoverflow({
    events: {
      afterChange(instance) {
        // console.log(instance.elements.container);
      },
    },
  });
});
