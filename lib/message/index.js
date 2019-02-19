const { spawnHelper } = require('../utils'),
      Client = require('./client'),
      actions = require('./actions');

module.exports = (actor, message, logEntry) => new Client(spawnHelper(actor, actions, message), logEntry);
