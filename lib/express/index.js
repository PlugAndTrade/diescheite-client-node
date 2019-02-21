/**
 * Express application
 * @external ExpressApplication
 * @see {@link https://expressjs.com/en/api.html#express|Express}
 */

/**
 * Express middleware
 * @external ExpressMiddleware
 * @see {@link https://expressjs.com/en/api.html#express|Express}
 */

/**
 * Express error handler
 * @external ExpressErrorHandler
 * @see {@link https://expressjs.com/en/api.html#express|Express}
 */

/**
 * Implements express specific functions to provide tracing and logging to express middlewares.
 *
 * @module express
 * @see {@link EntryClient}
 * @see [publishers]{@link module:publishers}
 */

module.exports = {
  errorHandler: require('./error-handler'),
  middleware: require('./middleware')
};
