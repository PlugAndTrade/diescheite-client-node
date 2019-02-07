const uuid = require('uuid/v4');

module.exports = {
  generic: scope => ({
    id: (scope && scope.id) || uuid(),
    parentId: (scope && scope.parentId) || uuid(),
    correlationId: (scope && scope.correlationId) || uuid(),
    protocol: (scope && scope.protocol) || '',
    route: (scope && scope.route) || '',
  }),
  forward: scope => ({
    parentId: (scope && scope.id) || uuid(),
    correlationId: (scope && scope.correlationId) || uuid()
  })
};
