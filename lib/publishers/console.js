const { dispatch, stop } = require('nact'),
      { PUBLISH } = require('../actions'),
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

module.exports = {
  start: (actorParent, opts = {}) => spawnHelper(actorParent, actions, opts),
  stop: (consolePublisher) => stop(consolePublisher),
};
