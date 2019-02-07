const R = require('ramda'),
      uuid = require('uuid/v4'),
      { stop, dispatch } = require('nact'),
      { spawnHelper, appendToProp } = require('./utils'),
      { ATTACH, FINALIZE, LOG } = require('./actions');

const addAttachment = appendToProp('attachments');

const logMessageActions = {
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

class DieScheiteLogMessage {
  constructor(actor, logEntry) {
    this.logEntry = logEntry;
    this.actor = actor;

    this.addHeader = this.logEntry.addHeader.bind(this.logEntry);
    this.log = this.logEntry.log.bind(this.logEntry);
    this.debug = this.logEntry.debug.bind(this.logEntry);
    this.info = this.logEntry.info.bind(this.logEntry);
    this.warning = this.logEntry.warning.bind(this.logEntry);
    this.error = this.logEntry.error.bind(this.logEntry);
    this.critical = this.logEntry.critical.bind(this.logEntry);
  }

  attach (name, body, contentType, contentEncoding) {
    dispatch(this.actor, { type: ATTACH, name, body, contentType, contentEncoding });
    return this;
  }
}

module.exports = function (actor, message, logEntry) {
  let msgActor = spawnHelper(
    actor,
    logMessageActions,
    message
  );
  return new DieScheiteLogMessage(msgActor, logEntry);
};
