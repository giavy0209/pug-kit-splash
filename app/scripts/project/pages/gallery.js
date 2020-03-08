import BlsGallery from '../../../../core/brayleinosplash/plugins/bls_gallery/bls_gallery';

app.ready(() => {
  const gallery = new BlsGallery({
    children: '.img',
    thumbnail: true,
    // loading: '../../../assets/images/ajax-loader.gif',
    events: {
      afterOpen(instance) {
        console.log('should run as expected');
      },
      beforeSlide(instance) {
        console.log('before slide');
      },
      afterSlide(instance) {
        console.log('after slide');
      },
    },
  });
  // console.log(gallery);
  const htmlGallery = new BlsGallery({
    selector: '#htmlGallery',
    thumbnail: false,
    children: '.load-more',
    events: {
      beforeContentLoad(instance) {
        instance.elements.contentMainTarget.classList.add('valign-middle');
      },
      afterOpen(instance) {
        console.log('should run as expected');
      },
    },
  });
});
