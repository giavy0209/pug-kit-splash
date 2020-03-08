import BlsSelection from '../../../../core/brayleinosplash/plugins/bls_selection/bls_selection';

app.ready(() => {
  // Demo
  // Default setting
  // Demo 1
  const selectDemoOne = new BlsSelection({ selector: '#defaultOne' })[0];

  // Demo 2
  const selectDemoTwo = new BlsSelection({ selector: '#defaultTwo' })[0];

  // Demo 3
  const selectDemoThree = new BlsSelection({ selector: '#defaultThree' })[0];

  // Demo 4
  const selectDemoFour = new BlsSelection({ selector: '#defaultFour' })[0];

  console.log(selectDemoOne, selectDemoTwo, selectDemoThree, selectDemoFour);

  document.querySelector('#destroyOne').addEventListener('click', () => {
    selectDemoOne.destroy();
  });
});
