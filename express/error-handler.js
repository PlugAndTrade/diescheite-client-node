module.exports = (err, req, res, next) => req.logger
  ? req.logger.error(`Uncaught error: ${err}`, err.stack)
  : next(err);
