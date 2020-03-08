import BlsDropdown from '../../../../core/brayleinosplash/plugins/bls_dropdown/bls_dropdown';

app.ready(() => {
  // Demo
  const dropdownMenu = new BlsDropdown()[0];
  document.querySelector('#destroy').addEventListener('click', () => {
    dropdownMenu.destroy();
  });
});
