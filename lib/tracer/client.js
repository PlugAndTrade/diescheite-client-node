const R = require('ramda'),
      uuid = require('uuid/v4'),
      { dispatch } = require('nact'),
      createTracer = require('./create'),
      { START_TRACE, END_TRACE } = require('../constants');

module.exports = class TracerClient {
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
    return createTracer(this, { id: uuid(), name }, TracerClient).run(action);
  }
};
