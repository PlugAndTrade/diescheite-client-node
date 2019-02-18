const R = require('ramda'),
      { stop, dispatch } = require('nact'),
      { queryChildren } = require('../utils'),
      { START_TRACE, END_TRACE, ADD_HEADER, TRACE, LOG, FINALIZE, PUBLISH } = require('../actions');

const finalizeChildren = queryChildren(FINALIZE);

module.exports = {
  [START_TRACE]: (state, { timestamp }, ctx) => {
    return R.over(R.lensProp('trace'), R.assoc('timestamp', timestamp))(state);
  },
  [END_TRACE]: (state, { end }, ctx) => {
    return R.over(R.lensProp('trace'), R.assoc('duration', end - state.trace.timestamp))(state);
  },
  [ADD_HEADER]: (state, msg, _ctx) => {
    dispatch(ctx.parent, msg);
    return state;
  },
  [LOG]: (state, msg, ctx) => {
    dispatch(ctx.parent, R.over(R.lensPath(['message','traceId']), R.defaultTo(state.trace.id))(msg));
    return state;
  },
  [TRACE]: (state, msg, ctx) => {
    let children = R.pipe(R.prop('traces'), R.map(R.over(R.lensProp('parentId'), R.defaultTo(state.trace.id))))(msg);
    return R.over(R.lensProp('children'), R.concat(R.__, children))(state)
  },
  [FINALIZE]: (state, _msg, ctx) => {
    finalizeChildren(ctx)
      .then(() => dispatch(ctx.self, { type: PUBLISH }, ctx.sender))
    return state;
  },
  [PUBLISH]: (state, _msg, ctx) => {
    dispatch(ctx.parent, { type: TRACE, traces: R.concat([state.trace], state.children) });
    dispatch(ctx.sender, { id: state.id });
    stop(ctx.self);
    return state;
  }
};
