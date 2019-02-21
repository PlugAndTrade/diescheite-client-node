const { dispatch } = require('nact'),
      { ATTACH } = require('../constants');

/**
 * Proxies all functions of the main log entry.
 * Add the attach function, used to attach additional data to a log message.
 *
 * @todo Proxy remaining EntryClient methods.
 * @hideconstructor
 */
class MessageClient {
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

  /**
   * @function MessageClient#addHeader
   * @see {@link EntryClient#addHeader}
   */

  /**
   * @function MessageClient#log
   * @see {@link EntryClient#log}
   */

  /**
   * @function MessageClient#debug
   * @see {@link EntryClient#debug}
   */

  /**
   * @function MessageClient#info
   * @see {@link EntryClient#info}
   */

  /**
   * @function MessageClient#warning
   * @see {@link EntryClient#warning}
   */

  /**
   * @function MessageClient#error
   * @see {@link EntryClient#error}
   */

  /**
   * @function MessageClient#critical
   * @see {@link EntryClient#critical}
   */

  /**
   * Attaches additional data to a log message.
   *
   * @todo Add support for buffer body
   * @todo Add helper methods to serialize as json and encode with gzip.
   *
   * @param name {String} - The name of the attachment
   * @param body {String} - The attachment body
   * @param contentType {String} - Content type of data, eg "application/json".
   * @param contentEncoding {String} - Content encoding of data, eg "gzip".
   *
   * @return {MessageClient} Itself
   */
  attach (name, body, contentType, contentEncoding) {
    dispatch(this.actor, { type: ATTACH, name, body, contentType, contentEncoding });
    return this;
  }
};

module.exports = MessageClient;
