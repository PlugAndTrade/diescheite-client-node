const { dispatch, query } = require('nact'),
      uuid = require('uuid/v4'),
      { values: { DEBUG, INFO, WARNING, ERROR, CRITICAL } } = require('../levels'),
      { INIT, ADD_HEADER, EXTEND, FINALIZE } = require('../constants'),
      createMessage = require('../message'),
      createTracer = require('../tracer');

/**
 * @classdesc Functions and actions available to manipulate the main log object.
 *            This class should not be instantiated manually but through helper methods.
 * @hideconstructor
 */
class EntryClient {
  constructor (actor) {
    this.actor = actor;
  }

  /**
   * Add a header to the log entry.
   * Multiple values may be added to the same key by calling this function multiple times
   * with the same key.
   *
   * @param key {String} - The header key
   * @param value {String|Number|bool} - The header value
   *
   * @returns {EntryClient} This instance
   */
  addHeader (key, value) {
    dispatch(this.actor, { type: ADD_HEADER, key, value });
    return this;
  }

  /**
   * Add a log message to the log entry.
   *
   * @param level {Number} - The log level of this message, see [levels]{@link levels.values}
   * @param message {String} - Log message text.
   * @param stacktrace {String} - Stacktrace associated with the message if available.
   * @param traceId {String} - The id of the enclosing trace if available, see [Tracer]{@link TracerClient}.
   *
   * @returns {MessageClient} A reference to the log message.
   */
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

  /**
   * Add a debug log message to the log entry.
   *
   * @param message {String} - Log message text.
   *
   * @returns {MessageClient} A reference to the log message.
   */
  debug (message) {
    return this.log(DEBUG, message, undefined);
  }

  /**
   * Add an info log message to the log entry.
   *
   * @param message {String} - Log message text.
   *
   * @returns {MessageClient} A reference to the log message.
   */
  info (message) {
    return this.log(INFO, message, undefined);
  }

  /**
   * Add a warning log message to the log entry.
   *
   * @param message {String} - Log message text.
   *
   * @returns {MessageClient} A reference to the log message.
   */
  warning (message) {
    return this.log(WARNING, message, undefined);
  }

  /**
   * Add an error log message to the log entry.
   *
   * @param message {String} - Log message text.
   * @param stacktrace {String} - Stacktrace associated with the error.
   *
   * @returns {MessageClient} A reference to the log message.
   */
  error (message, stacktrace) {
    return this.log(ERROR, message, stacktrace);
  }

  /**
   * Add a critical log message to the log entry.
   *
   * @param message {String} - Log message text.
   * @param stacktrace {String} - Stacktrace associated with the error.
   *
   * @returns {MessageClient} A reference to the log message.
   */
  critical (message, stacktrace) {
    return this.log(CRITICAL, message, stacktrace);
  }

  /**
   * Starts a trace wrapping the supplied action.
   *
   * @param name {String} - The name of the trace. Do not use unique name, eg by including dynamic values.
   * @param action {TracedAction} - The action to be traced, it is invoked with the {@link TracerClient} representing
   *                                this trace.
   * @returns {Promise} A promise resolved with the return value of the action when the action is complete.
   */
  trace (name, action) {
    return createTracer(this, { id: uuid(), name }).run(action);
  }

  /**
   * Extend the log entry with custom data. Useful when adding eg http related data as response status and request uri.
   *
   * @param name {String} - Name of the property to associate the data with.
   * @param data {*} - Any json serializable data.
   *
   * @returns {EntryClient} This instance
   */
  extend (name, data) {
    dispatch(this.actor, { type: EXTEND, name, data });
    return this;
  }

  /**
   * Initialize the log entry, starts a timer among other initializations.
   *
   * @returns {EntryClient} This instance
   */
  init () {
    dispatch(this.actor, { type: INIT, timestamp: Date.now() });
    return this;
  }

  /**
   * Finalize the log entry, stops the timer. This will send a publish message to the parent of the log entry. The
   * parent is usually a log entry publisher.
   * @see {@link ConsolePublisher.start}
   *
   * @returns {EntryClient} This instance
   */
  finalize () {
    return query(this.actor, { type: FINALIZE, end: Date.now() }, 100);
  }
};

module.exports = EntryClient;
