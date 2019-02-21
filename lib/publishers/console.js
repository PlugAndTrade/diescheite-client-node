const { dispatch, stop } = require('nact'),
      { PUBLISH } = require('../constants'),
      { spawnHelper } = require('../utils');

const actions = {
  [PUBLISH]: (state, { entry }, { sender }) => {
    dispatch(
      sender,
      new Promise((resolve) => setImmediate(resolve))
        .then(() => console.log(JSON.stringify(entry, null, state.pretty ? 2 : null)))
    );
    return state;
  }
};

/**
 * @module {Object} publishers/console
 */
const ConsolePublisher =  {
  /**
   * Starts a new console publisher.
   *
   * @static
   * @method start
   * @param actorParent {Actor} - An actor used as parent for the publisher actor. This is usually the nact system
   * returned from `nact.start()`
   * @param {Object} [opts] - Optional options object
   * @param {bool} opts.pretty - If true entries will be pretty printed. Else entries are printed as minimal json.
   *
   * @returns {Actor} A reference to the publisher actor.
   */
  start: (actorParent, opts = {}) => spawnHelper(actorParent, actions, opts),
  /**
   * Stops a running console publisher.
   *
   * @static
   * @method stop
   * @param {Actor} - A reference to an actor as returned by {@link publishers~console.start}
   */
  stop: (consolePublisher) => stop(consolePublisher),
};

module.exports = ConsolePublisher;
