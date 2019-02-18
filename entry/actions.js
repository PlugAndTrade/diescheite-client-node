const R = require('ramda'),
      { stop, dispatch, query } = require('nact'),
      { queryChildren, logMaxLevel, levelCategory, appendToProp } = require('../utils'),
      { INIT, ADD_HEADER, TRACE, LOG, EXTEND, FINALIZE, PUBLISH } = require('../actions');

const finalizeChildren = queryChildren(FINALIZE);
const addMessage = appendToProp('messages');
const addHeader = appendToProp('headers');
const addTraces = R.flip(R.uncurryN(2, obj => R.over(
  R.lensProp('trace'),
  R.concat(R.__, obj)
)));

module.exports = {
  [INIT]: (state, { timestamp }, _ctx) => R.mergeRight(state, {
    headers: [],
    messages: [],
    trace: [],
    timestamp,
  }),
  [ADD_HEADER]: (state, msg, _ctx) => R.pipe(R.props(['key', 'value']), R.apply(R.objOf), addHeader(state))(msg),
  [LOG]: (state, msg, _ctx) => R.pipe(R.prop('message'), addMessage(state))(msg),
  [TRACE]: (state, msg, _ctx) => R.pipe(R.prop('traces'), addTraces(state))(msg),
  [EXTEND]: (state, msg, _ctx) => R.pipe(R.props(['name', 'data']), R.apply(R.assoc))(msg)(state),
  [FINALIZE]: (state, { end }, ctx) => {
    finalizeChildren(ctx)
      .then(() => dispatch(ctx.self, { type: PUBLISH, end }, ctx.sender));
    return state;
  },
  [PUBLISH]: (state, { end }, ctx) => {
    let level = logMaxLevel(state);

    let fin = R.pipe(
      R.mergeLeft({
        duration: end - state.timestamp,
        level,
        levelCategory: levelCategory(level)
      }),
      R.over(R.lensProp('messages'), R.pipe(R.sortBy(R.prop('index')), R.map(R.dissoc('index'))))
    )(state);

    dispatch(ctx.sender, query(ctx.parent, { type: PUBLISH, entry: fin }, 100));
    stop(ctx.self);
  }
};
