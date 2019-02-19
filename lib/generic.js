const R = require('ramda'),
      loggedAction = require('./logged-action');

module.exports = function (config, publisher) {
  const serviceInfo = R.pick([ 'serviceId', 'serviceInstanceId', 'serviceVersion' ], config);

  return {
    loggedAction: (scope, action) => loggedAction(serviceInfo, scope, publisher, action),
  };
};
