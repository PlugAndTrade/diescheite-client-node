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

module.exports = (opts, app) => {
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
      route: app ? findRoute(req, app._router).pattern : '',
      protocol: 'http'
    });

    res.set('X-Scope-Id', scope.id);

    loggedAction(serviceInfo, scope, publisher, entry => {
      req.logger = entry;
      next();
      return new Promise((resolve) => {
        res.on('close', () => {
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
        });
      });
    });
  };
};
