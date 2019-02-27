const R = require('ramda'),
      loggedAction = require('../logged-action'),
      findRoute = require('./find-route'),
      headersFilter = require('./headers-filter'),
      Scope = require('../scope');

const DEFAULT_MIDDLEWARE_OPTS = {
  censoredHeaders: [
    'authorization',
    'user-agent',
  ],
  ignoredHeaders: [
    'host',
    'date',
    'x-powered-by',
    'x-scope-id',
  ],
  ignoredRoutes: [
    '/healthcheck'
  ]
};

const getOpts = R.pipe(R.pick(R.keys(DEFAULT_MIDDLEWARE_OPTS)), R.mergeRight(DEFAULT_MIDDLEWARE_OPTS));
const getServiceInfo = R.pick(['serviceId', 'serviceVersion', 'serviceInstanceId']);

/**
 * Creates a middleware initializing and publishing log entries.
 * The [entry]{@link EntryClient} is set on the logger key on the request object.
 *
 * @example
const express = require('express'),
      DieScheite = require('die-scheite');

const actSystem = DieScheite.start();
const publisher = DieScheite.publishers.console.start(actSystem);

const app = express();

app.use(DieScheite.express.middleware(
  {
    serviceId: 'my-super-service-api',
    serviceVersion: '0.1.2',
    serviceInstanceId: process.env.POD_NAME,
    publisher,
    ignoredRoutes: [ '/healthcheck', /ignored/ ],
    censoredHeaders: [ 'user-agent', 'foo' ]
    ignoredHeaders: [ 'date', 'x-powered-by' ]
  },
  app,
));

app.get('/:id', (req, res, next) => {
  req.logger.info(`Requested id: ${req.params.id}`);
  res.send(JSON.stringify({foo: 'bar'}));
});
 *
 * @memberof module:express
 * @method middleware
 *
 * @param {Object} opts - Options and configuration
 * @param {String} opts.serviceId - 
 * @param {String} opts.serviceInstanceId - 
 * @param {String} opts.serviceVersion - 
 * @param {String[]} opts.censoredHeaders - Headers whose values is replaced with '<censored>' in the log entry.
 * @param {String[]} opts.ignoredHeaders - Headers whose values is omitted from the log entry.
 * @param {Array<String|RegExp>} opts.ignoredRoutes - Strings or RegExp matching urls for which a log entry should not be
 *                                                    initialized.
 *
 * @returns {external:ExpressMiddleware}
 */
module.exports = (opts) => {
  let { publisher } = opts;
  let serviceInfo = getServiceInfo(opts);
  opts = getOpts(opts);

  const ignoredRoutePatterns = R.map(R.constructN(1, RegExp))(opts.ignoredRoutes);
  const ignoredRoute = (route) => R.any(R.invoker(1, 'test')(route), ignoredRoutePatterns)

  const filterHeaders = headersFilter(
    R.reduce(R.flip(R.assoc(R.__, true)), {})(opts.censoredHeaders),
    opts.ignoredHeaders
  );

  return (req, res, next) => {
    if (ignoredRoute(req.originalUrl)) {
      next();
      return;
    }

    let scope = Scope.generic({
      correlationId: req.headers['x-correlation-id'],
      parentId: req.headers['x-parent-scope-id'],
      route: findRoute(req, req.app._router).pattern,
      protocol: 'http'
    });

    res.set('X-Scope-Id', scope.id);

    loggedAction(serviceInfo, scope, publisher, entry => {
      req.logger = entry;
      next();
      return new Promise((resolve) => {
        function onResponseEnd(a, b, c, d) {
          res.removeListener('finish', onResponseEnd);
          res.removeListener('close', onResponseEnd);
          req.logger.extend('http', {
            request: {
              method: req.method,
              host: req.hostname,
              uri: req.originalUrl,
              headers: filterHeaders(req.headers)
            },
            response: res.finished
              ? { statusCode: res.statusCode, headers: filterHeaders(res.getHeaders()) }
              : null
          });
          resolve();
        }

        res.on('finish', onResponseEnd);
        res.on('close', onResponseEnd);
      });
    });
  };
};
