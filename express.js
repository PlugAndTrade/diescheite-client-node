const R = require('ramda'),
      loggedAction = require('./logged-action'),
      Scope = require('./scope');

function headersFilter(censoredHeaders, ignoredHeaders) {
  return R.pipe(
    R.omit(ignoredHeaders),
    R.mapObjIndexed((val, key) => key in censoredHeaders ? '<censored>' : val)
  );
}

function getPattern(router, url) {
  let match = router.regexp.exec(url);
  let pattern = router.keys.reduce((agg, key) => agg.replace(match[key.offset], `:${key.name}`), match[0]);
  let urlTail = url.substring(match.index + match[0].length);
  return { pattern, urlTail };
}

function _findRoute(path, router, url, method) {
  if (path.end || !router.regexp.test(url)) {
    return path;
  }

  let { pattern, urlTail } = getPattern(router, url);

  if (R.pathSatisfies(R.identity, [ 'route', 'methods', method ])(router)) {
    return {
      matched: true,
      end: true,
      pattern
    };
  }

  if (R.propSatisfies(R.equals('router'), 'name')(router)) {
    let subRoute = R.reduce(
      (subPath, subRouter) => _findRoute(subPath, subRouter, urlTail, method),
      { matched: false, pattern: '' },
      router.handle.stack
    );

    return {
      matched: subRoute.matched,
      pattern: pattern + subRoute.pattern,
      subRoute,
      end: subRoute.end
    };
  }

  return {
    matched: true,
    pattern
  }
}

function findRoute(req, app) {
  return R.reduce(
    (path, router) => _findRoute(path, router, req.originalUrl, req.method.toLowerCase()),
    { matched: false, pattern: '' },
    app._router.stack
  );
}

function errorHandler(err, req, res, next) {
  if (req.logger) {
    req.logger.error(`Uncaught error: ${err}`, err.stack);
  } else {
    next(err);
  }
}

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

function middleware(serviceInfo, publisher, app, opts) {
  opts = R.mergeRight(DEFAULT_MIDDLEWARE_OPTS, opts);

  const ignoredRoutes = R.map(R.constructN(1, RegExp))(opts.ignoredRoutes);
  const ignoredRoute = (route) => R.any(R.invoker(1, 'test')(route), ignoredRoutes)

  const filterHeaders = headersFilter(
    R.reduce(R.flip(R.assoc(R.__, true)), {})(opts.censoredHeaders),
    opts.ignoredHeaders
  );

  function logger(req, res, next) {
    if (ignoredRoute(req.originalUrl)) {
      next();
      return;
    }

    let scope = Scope.generic({
      correlationId: req.headers['x-correlation-id'],
      parentId: req.headers['x-parent-scope-id'],
      route: app ? findRoute(req, app).pattern : '',
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
  }

  return logger;
}

module.exports = {
  findRoute,
  errorHandler,
  headersFilter,
  middleware
};
