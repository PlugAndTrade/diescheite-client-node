const R = require('ramda');

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

module.exports = (req, router) => R.reduce(
  (path, router) => _findRoute(path, router, req.originalUrl, req.method.toLowerCase()),
  { matched: false, pattern: '' },
  router.stack
);
