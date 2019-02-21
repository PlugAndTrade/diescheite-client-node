/**
 * Generic logging features
 * @module generic
 */
const R = require('ramda'),
      loggedAction = require('./logged-action');

/**
 * @callback GenericLoggedAction
 *
 * @param {Obejct} scope - The scope, see {@link module:scope}
 * @param {module:logged-action~LoggableAction} action - The action to invoke.
 *
 * @returns {Promise} A promise resolving with the returned value of action when action is complete.
 */

/**
 * @typedef {Object} GenericLogger
 *
 * @property {GenericLoggedAction} loggedAction - A function to log generic function invokation.
 */

/**
 * Configure generic logger
 * @see {@link EntryClient}
 * @see [publishers]{@link module:publishers}
 * @example
const { start, generic, publishers, scope } = require('die-scheite');
const system = start();
const publisher = publishers.consoele.start(system);
const myScope = scope.generic();
const config = {
  serviceId: 'my-super-service',
  serviceInstanceId: process.env.POD_NAME,
  serviceVersion: '0.1.2'
};

generic(config, publisher)
  .loggedAction(myScope, (entry) => {
    entry.info('Actions started');
    // ... some code
    return 'Hello, german library.';
  })
  .then(({ result }) => console.log(result)); // Prints 'Hello, german library.'
 *
 * @param {Object} config - A configuration object
 * @param {String} config.serviceId - The serviceId reported with all log entries. Usually the name of the service or
 *                                    project.
 * @param {String} config.serviceInstanceId - The serviceInstanceId reported with all log entries. Used to identify this
 *                                            instance if multiple instances are running simultaneously.
 * @param {String} config.serviceVersion - The serviceVersion reported with all log entries.
 * @param {Actor} publisher - A reference to an actor implementing the PUBLISH message type. See {@link module:publishers}.
 *
 * @returns {GenericLogger} An object with a configured loggedAction function.
 */
module.exports = function (config, publisher) {
  const serviceInfo = R.pick([ 'serviceId', 'serviceInstanceId', 'serviceVersion' ], config);

  return {
    loggedAction: (scope, action) => loggedAction(serviceInfo, scope, publisher, action),
  };
};
