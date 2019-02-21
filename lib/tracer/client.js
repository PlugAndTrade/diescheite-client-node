const R = require('ramda'),
      uuid = require('uuid/v4'),
      { dispatch } = require('nact'),
      createTracer = require('./create'),
      { START_TRACE, END_TRACE } = require('../constants');

/**
 * Traced action
 * @see {@link EntryClient#trace}
 * @see {@link TracerClient#trace}
 *
 * @callback TracedAction
 * @param tracer {TracerClient} - An instance used to manipulate the new trace
 * @returns {*} Anything
 */

/**
 * Runs a trace and proxies all functions of the main log entry to add traceId where applicable.
 *
 * @todo Proxy remaining EntryClient methods.
 * @hideconstructor
 */
class TracerClient {
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

  /**
   * @function TracerClient#addHeader
   * @see {@link EntryClient#addHeader}
   */

  /**
   * Add traceId to the log message and passes the call to {@link EntryClient#log}
   * @function TracerClient#log
   * @see {@link EntryClient#log}
   */

  /**
   * Add traceId to the log message and passes the call to {@link EntryClient#debug}
   * @function TracerClient#debug
   * @see {@link EntryClient#debug}
   */

  /**
   * Add traceId to the log message and passes the call to {@link EntryClient#info}
   * @function TracerClient#info
   * @see {@link EntryClient#info}
   */

  /**
   * Add traceId to the log message and passes the call to {@link EntryClient#warning}
   * @function TracerClient#warning
   * @see {@link EntryClient#warning}
   */

  /**
   * Add traceId to the log message and passes the call to {@link EntryClient#error}
   * @function TracerClient#error
   * @see {@link EntryClient#error}
   */

  /**
   * Add traceId to the log message and passes the call to {@link EntryClient#critical}
   * @function TracerClient#critical
   * @see {@link EntryClient#critical}
   */

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

  /**
   * Starts a sub trace of the trace repesented by this instance, wrapping the supplied action.
   *
   * @param name {String} - The name of the trace. Do not use unique name, eg by including dynamic values.
   * @param action {TracedAction} - The action to be traced, it is invoked with the {@link TracerClient} representing
   *                                this trace.
   * @returns {Promise} A promise resolved with the return value of the action when the action is complete.
   */
  trace (name, action) {
    return createTracer(this, { id: uuid(), name }, TracerClient).run(action);
  }
};

module.exports = TracerClient;
