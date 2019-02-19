const { spawnHelper } = require('../utils'),
      actions = require('./actions');

module.exports = (parent, traceInfo, constructor) => new constructor(
  spawnHelper(
    parent.actor,
    actions,
    { id: traceInfo.id, trace: traceInfo, children: [] }
  ),
  parent
);
