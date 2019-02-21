/**
 * This error handler will log an error to the log entry if one is initialized for this request.
 * If a log entry is initialized the next error handler will NOT be called.
 * If no log entry in initialzied the next error handler will be called and this handler does nothing.
 *
 * @example
const express = require('express'),
      DieScheite = require('die-scheite');

const app = express();

// do what apps do...

app.use(DieScheite.express.errorHandler);
 *
 * @memberof module:express
 * @method errorHandler
 * @see {@link external:ExpressErrorHandler}
 *
 * @param {*} err - The error
 * @param {IncommingMessage} req - See https://expressjs.com/en/api.html#req.
 * @param {ServerResponse} res - See https://expressjs.com/en/api.html#res.
 * @param {function(err)} next - The next error handler in the pipeline
 */
module.exports = (err, req, res, next) => req.logger
  ? req.logger.error(`Uncaught error: ${err}`, err.stack)
  : next(err);
