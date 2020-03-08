import BlsTruncateHtml from '../../../../core/brayleinosplash/plugins/bls_truncatehtml/bls_truncatehtml';

app.ready(() => {
  const truncate = new BlsTruncateHtml();
  // console.log(truncate);
  document.querySelector('#destroy').addEventListener('click', () => {
    truncate[0].destroy();
  });
});
