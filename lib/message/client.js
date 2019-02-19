const { dispatch } = require('nact'),
      { ATTACH } = require('../constants');

module.exports = class MessageClient {
  constructor (actor, logEntry) {
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
};
