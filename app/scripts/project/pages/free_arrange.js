import BlsFreeArrange from '../../../../core/brayleinosplash/plugins/bls_free_arrange/bls_free_arrange';

app.load(() => {
  const _free = new BlsFreeArrange({
    selector: '#freeArrange',
    events: {
      initialized(instance) {
        // setTimeout(() => {
        //   console.log(instance.elements.items[0].offsetWidth);
        // }, 1000);
      },
    },
  })[0];
});
