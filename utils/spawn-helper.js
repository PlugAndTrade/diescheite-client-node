const { spawn } = require('nact'),
      uuid = require('uuid/v4');

module.exports = (parent, actions, initialState) => spawn(
  parent,
  (state, msg, ctx) => {
    if (!actions[msg.type]) {
      throw new Error(`Unknown action: ${msg.type}`)
    }
    return actions[msg.type](state, msg, ctx)
  },
  initialState && initialState.id || uuid(),
  { initialState }
);
