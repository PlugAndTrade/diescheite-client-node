const createTracer = require('./create'),
      Client = require('./client');

module.exports = (parent, traceInfo) => createTracer(parent, traceInfo, Client);
