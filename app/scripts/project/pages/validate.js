import BlsValidation from '../../../../core/brayleinosplash/plugins/bls_validation/bls_validation';
import BlsSelection from '../../../../core/brayleinosplash/plugins/bls_selection/bls_selection';

app.ready(() => {
  const [secltion] = new BlsSelection();
  const [validations] = new BlsValidation();
});
