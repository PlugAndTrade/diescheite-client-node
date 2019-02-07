const R = require('ramda'),
      uuid = require('uuid/v4'),
      { stop, dispatch } = require('nact'),
      { queryChildren, spawnHelper, appendToProp } = require('./utils'),
      { START_TRACE, END_TRACE, ADD_HEADER, TRACE, LOG, FINALIZE, PUBLISH } = require('./actions');

const finalizeChildren = queryChildren(FINALIZE);

const tracerActions = {
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

class DieScheiteLogTracer {
  constructor(actor, logger) {
    this.logger = logger;
    this.actor = actor;

    this.addHeader = this.logger.addHeader;
    this.log = this.logger.log;
    this.debug = this.logger.debug;
    this.info = this.logger.info;
    this.warning = this.logger.warning;
    this.error = this.logger.error;
    this.critical = this.logger.critical;
  }

  run(action) {
    return new Promise((resolve, reject) => {
        dispatch(this.actor, { type: START_TRACE, timestamp: Date.now() });
        try {
          Promise.resolve(action(this)).then(resolve).catch(reject);
        } catch (e) {
          reject(e);
        }
      })
      .then(R.tap(() => dispatch(this.actor, { type: END_TRACE, end: Date.now() })));
  }

  trace (name, action) {
    return createTracer(this, { id: uuid(), name }).run(action);
  }
}

function createTracer(parent, traceInfo) {
  let tracer = spawnHelper(
    parent.actor,
    tracerActions,
    { id: traceInfo.id, trace: traceInfo, children: [] }
  )
  return new DieScheiteLogTracer(tracer, parent);
}

module.exports = createTracer;
