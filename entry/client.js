const { dispatch, query } = require('nact'),
      uuid = require('uuid/v4'),
      { values: { DEBUG, INFO, WARNING, ERROR, CRITICAL } } = require('../levels'),
      { INIT, ADD_HEADER, EXTEND, FINALIZE } = require('../actions'),
      createMessage = require('../message'),
      createTracer = require('../tracer');


module.exports = class EntryClient {
  constructor(actor) {
    this.actor = actor;
  }

  addHeader (key, value) {
    dispatch(this.actor, { type: ADD_HEADER, key, value });
    return this;
  }

  log (level, message, stacktrace, traceId) {
    return createMessage(
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
    return this.log(DEBUG, message, undefined);
  }

  info (message) {
    return this.log(INFO, message, undefined);
  }

  warning (message) {
    return this.log(WARNING, message, undefined);
  }

  error (message, stacktrace) {
    return this.log(ERROR, message, stacktrace);
  }

  critical (message, stacktrace) {
    return this.log(CRITICAL, message, stacktrace);
  }

  trace (name, action) {
    return createTracer(this, { id: uuid(), name }).run(action);
  }

  extend (name, data) {
    dispatch(this.actor, { type: EXTEND, name, data });
  }

  init () {
    dispatch(this.actor, { type: INIT, timestamp: Date.now() });
  }

  finalize () {
    return query(this.actor, { type: FINALIZE, end: Date.now() }, 100);
  }
};
