const { start } = require('nact');

module.exports = {
  start: (nactParent) => nactParent || start(),
  express: require('./lib/express'),
  generic: require('./lib/generic'),
  publishers: require('./lib/publishers'),
  scope: require('./lib/scope')
};
