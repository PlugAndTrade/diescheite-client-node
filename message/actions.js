const R = require('ramda'),
      uuid = require('uuid/v4'),
      { stop, dispatch } = require('nact'),
      { appendToProp } = require('../utils'),
      { ATTACH, FINALIZE, LOG } = require('../actions');

const addAttachment = appendToProp('attachments');

module.exports = {
  [ATTACH]: (state, msg, _ctx) => R.pipe(
    R.pick(['name', 'body', 'contentType', 'contentEncoding']),
    R.over(R.lensProp('id'), R.defaultTo(uuid())),
    addAttachment(state)
  )(msg),
  [FINALIZE]: (state, _msg, ctx) => {
    dispatch(ctx.parent, { type: LOG, message: state });
    dispatch(ctx.sender, { id: state.id });
    stop(ctx.self);
  }
};
