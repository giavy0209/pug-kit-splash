import BlsVideo from '../../../../core/brayleinosplash/plugins/bls_video/bls_video';

app.ready(() => {
  const videos = new BlsVideo();
  [window.v] = videos;
});
