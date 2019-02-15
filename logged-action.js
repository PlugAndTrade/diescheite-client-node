const R = require('ramda'),
      LogEntry = require('./log-entry');

function loggedAction(serviceInfo, scope, publisher, action) {
  let entry = R.pipe(
    R.pick([ 'id', 'parentId', 'correlationId', 'protocol', 'route' ]),
    R.mergeLeft(serviceInfo),
  )(scope);

  let logger = LogEntry(entry, publisher);

  logger.init();
  return new Promise((resolve, reject) => Promise.resolve(action(logger)).then(resolve).catch(reject))
    .then(result => ({ result, published: logger.finalize() }));
}

module.exports = loggedAction;
