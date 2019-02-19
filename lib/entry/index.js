const actions = require('./actions'),
      Client = require('./client'),
      { spawnHelper } = require('../utils');

module.exports = (data, publisher) => new Client(spawnHelper(publisher, actions, data));
