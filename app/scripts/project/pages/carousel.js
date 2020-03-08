import BlsLazyElement from '../../../../core/brayleinosplash/plugins/bls_lazy/bls_lazy';
import BlsCarousel from '../../../../core/brayleinosplash/plugins/bls_carousel/bls_carousel';

app.ready(() => {
  // const lazies = new BlsLazyElement();
  const carousels = new BlsCarousel({
    independHeight: true,
  });

  const carouselsDuplicate = new BlsCarousel({
    independHeight: true,
  });

  const _carouselJS = new BlsCarousel({
    selector: '#blsCarouselJS',
    loop: true,
    items: 3,
    itemsMove: 1,
  });

  const _resCarousel = new BlsCarousel({
    selector: '.bls-carousel__responsive',
    loop: 1,
    responsive: [{
      breakpoint: 0,
      items: 1,
      itemsMove: 1,
    }, {
      breakpoint: 768,
      items: 2,
      itemsMove: 2,
    }, {
      breakpoint: 1200,
      items: 4,
      itemsMove: 4,
    }, {
      breakpoint: 992,
      items: 3,
      itemsMove: 3,
    }],
  });

  document.querySelector('#destroy').addEventListener('click', () => {
    _carouselJS[0].destroy();
  });
});
