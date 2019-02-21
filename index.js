const { start } = require('nact');

/**
 * @module die-scheite
 */
module.exports = {
  start: (nactParent) => nactParent || start(),
  /**
   * Exposes express specific setup and utilities
   * @type {module:express}
   */
  express: require('./lib/express'),
  /**
   * Exposes generic setup and logging functions.
   * @type {module:generic}
   */
  generic: require('./lib/generic'),
  /**
   * Exposes publisher related functions
   * @type {module:publishers}
   */
  publishers: require('./lib/publishers'),
  /**
   * Exposes scope related functions
   * @type {module:scope}
   */
  scope: require('./lib/scope')
};
