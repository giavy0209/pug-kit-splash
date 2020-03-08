// http://dev.splashinteractive.sg/blsws-doc/scripts/page_dropdown.min.js
// http://dev.splashinteractive.sg/blsws-doc/scripts/page_selection.min.js

import BlsScript from '../../../../core/brayleinosplash/plugins/bls_script/bls_script';

app.ready(() => {
  const scripts = new BlsScript({
    src: 'http://dev.splashinteractive.sg/blsws-doc/scripts/page_dropdown.min.js|http://dev.splashinteractive.sg/blsws-doc/scripts/page_selection.min.js',
    events: {
      afterLoaded(instance, script) {
        console.log(`${script} loaded`);
      },
    },
  });

  [app.scriptLoad] = scripts;
});
