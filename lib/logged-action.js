/**
 * Loggable action
 * @callback LoggableAction
 *
 * @param {EntryClient} entry - An instance used to manipulate the log entry.
 * @returns {*} Anything
 */

/**
 * Implements the core of die scheite, create, track and publiish log entries.
 *
 * @module logged-action
 * @see {@link EntryClient}
 * @see [publishers]{@link module:publishers}
 * @see [generic]{@link module:generic}
 * @see [express]{@link module:express}
 */

const R = require('ramda'),
      Entry = require('./entry');

/**
 * Create, track and publish a log entry for the duration of the supplied action.
 * @method loggedAction
 *
 * @param {Object} serviceInfo - An object with service info
 * @param {String} serviceInfo.serviceId - The serviceId reported with all log entries. Usually the name of the service or
 *                                         project.
 * @param {String} serviceInfo.serviceInstanceId - The serviceInstanceId reported with all log entries. Used to identify this
 *                                                 instance if multiple instances are running simultaneously.
 * @param {String} serviceInfo.serviceVersion - The serviceVersion reported with all log entries.
 * @param {Object} scope - Scope specifi data
 * @param {Actor} publisher - A reference to a publisher actor.
 * @param {LoggableAction} action - The action to invoke in the logged scope 
 *
 * @returns {Promise} A promise resolved with the return value of the action when the action is completed.
 */
module.exports = function loggedAction(serviceInfo, scope, publisher, action) {
  let entry = R.pipe(
    R.pick([ 'id', 'parentId', 'correlationId', 'protocol', 'route' ]),
    R.mergeLeft(serviceInfo),
  )(scope);

  let logger = Entry(entry, publisher);

  logger.init();
  return new Promise((resolve, reject) => Promise.resolve(action(logger)).then(resolve).catch(reject))
    .then(result => ({ result, published: logger.finalize() }));
}
