const { dispatch, stop } = require('nact'),
      { PUBLISH } = require('../actions'),
      { spawnHelper } = require('../utils');

const delay = t => new Promise((resolve) => t <= 0 ? setImmediate(resolve) : setTimeout(resolve, t));

const consolePublisherActions = {
  [PUBLISH]: (state, { entry }, ctx) => {
    dispatch(
      ctx.sender,
      delay(0)
        .then(() => console.log(JSON.stringify(entry, null, state.pretty ? 2 : null)))
    );
    return state;
  }
};

module.exports = {
  start: function (actorParent, opts = {}) {
    return spawnHelper(actorParent, consolePublisherActions, opts);
  },
  stop: function (consolePublisher) {
    stop(logger);
  }
};
