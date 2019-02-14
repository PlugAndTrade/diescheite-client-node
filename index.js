const R = require('ramda'),
      { dispatch } = require('nact'),
      uuid = require('uuid/v4'),
      { spawnHelper } = require('./utils'),
      { PUBLISH } = require('./actions'),
      tracingScope = require('./tracingScope'),
      LogEntry = require('./log-entry');

const delay = t => new Promise((resolve) => t <= 0 ? setImmediate(resolve) : setTimeout(resolve, t));

const consolePublisherActions = {
  [PUBLISH]: (state, { entry }, ctx) => {
    dispatch(ctx.sender, delay(0)
      .then(() => {
        console.log(JSON.stringify(entry, null, 2));
        return {};
      })
    );
    return state;
  }
};

module.exports = function ({actorParent, ...config}) {
  const serviceInfo = R.pick([ 'serviceId', 'serviceInstanceId', 'serviceVersion' ], config);
  const publisher = spawnHelper(actorParent, consolePublisherActions, {});

  function loggedAction(scope, action) {
    let entry = R.pipe(
      R.pick([ 'id', 'parentId', 'correlationId', 'protocol', 'route' ]),
      R.mergeLeft(serviceInfo),
    )(scope);

    let logger = LogEntry(entry, publisher);

    logger.init();
    return new Promise((resolve, reject) => Promise.resolve(action(logger)).then(resolve).catch(reject))
      .then(result => ({ result, published: logger.finalize() }));
  }

  function expressMiddleware(req, res, next) {
    let scope = {
      correlationId: req.headers['x-correlation-id'],
      parentId: req.headers['x-parent-scope-id'],
      route: '',
      protocol: 'http'
    };

    const censoredHeaders = {
      'authorixation': true,
      'user-agent': true,
    };
    const ignoredHeaders = [
      'host',
      'date',
      'x-powered-by'
    ];

    loggedAction(tracingScope.generic(scope), entry => {
      req.logger = entry;
      next();
      return new Promise((resolve) => {
        res.on('close', () => {
          req.logger.extend('http', {
            request: {
              method: req.method,
              host: req.hostname,
              uri: req.originalUrl,
              headers: R.pipe(
                R.omit(ignoredHeaders),
                R.mapObjIndexed((val, key) => key in censoredHeaders ? '<censored>' : val)
              )(req.headers)
            },
            response: res.finished
              ? { statusCode: res.statusCode, headers: R.omit(ignoredHeaders, res.getHeaders()) }
              : null
          });
          resolve();
        });
      });
    });
  }

  function expressErrorHandler(err, req, res, next) {
    req.logger.error(`Uncaught error: ${err}`, err.stack);
    next(err);
  }

  function stop() {
    stop(publisher);
  }

  return {
    loggedAction,
    expressMiddleware,
    expressErrorHandler,
    stop,
  };
};
