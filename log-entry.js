const R = require('ramda'),
      uuid = require('uuid/v4'),
      { stop, dispatch, spawn, query } = require('nact'),
      { queryChildren, logMaxLevel, LEVELS, levelCategories, levelCategory, spawnHelper, appendToProp } = require('./utils'),
      LogMessage = require('./log-message'),
      LogTracer = require('./log-tracer'),
      { INIT, ADD_HEADER, TRACE, LOG, FINALIZE, PUBLISH } = require('./actions');

const finalizeChildren = queryChildren(FINALIZE);

const addMessage = appendToProp('messages');
const addHeader = appendToProp('headers');
const addTraces = R.flip(R.uncurryN(2, obj => R.over(
  R.lensProp('trace'),
  R.concat(R.__, obj)
)));

const logEntryActions = {
  [INIT]: (state, { timestamp }, _ctx) => R.mergeRight(state, {
    headers: [],
    messages: [],
    trace: [],
    timestamp,
  }),
  [ADD_HEADER]: (state, msg, _ctx) => R.pipe(R.props(['key', 'value']), R.apply(R.objOf), addHeader(state))(msg),
  [LOG]: (state, msg, _ctx) => R.pipe(R.prop('message'), addMessage(state))(msg),
  [TRACE]: (state, msg, _ctx) => R.pipe(R.prop('traces'), addTraces(state))(msg),
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

class DieScheiteLogEntry {
  constructor(actor) {
    this.actor = actor;
  }

  addHeader (key, value) {
    dispatch(this.actor, { type: ADD_HEADER, key, value });
    return this;
  }

  log (level, message, stacktrace, traceId) {
    return LogMessage(
      this.actor,
      {
        id: uuid(),
        timestamp: Date.now(),
        index: process.hrtime.bigint(),
        level,
        message,
        stacktrace,
        traceId,
        attachments: []
      },
      this
    );
  }

  debug (message) {
    return this.log(LEVELS.DEBUG, message, undefined);
  }

  info (message) {
    return this.log(LEVELS.INFO, message, undefined);
  }

  warning (message) {
    return this.log(LEVELS.WARNING, message, undefined);
  }

  error (message, stacktrace) {
    return this.log(LEVELS.ERROR, message, stacktrace);
  }

  critical (message, stacktrace) {
    return this.log(LEVELS.CRITICAL, message, stacktrace);
  }

  trace (name, action) {
    return LogTracer(this, { id: uuid(), name }).run(action);
  }

  init () {
    dispatch(this.actor, { type: INIT, timestamp: Date.now() });
  }

  finalize () {
    return query(this.actor, { type: FINALIZE, end: Date.now() }, 100);
  }
}

module.exports = function (logEntryData, publisher) {
  let actor = spawnHelper(
    publisher,
    logEntryActions,
    logEntryData
  );

  return new DieScheiteLogEntry(actor);
};
