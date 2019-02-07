const R = require('ramda'),
      uuid = require('uuid/v4'),
    { logMaxLevel, LEVELS, levelCategories, levelCategory } = require('./utils');

function attach(message, name, body, contentType, contentEncoding, headers) {
  let attachment = {
    name,
    body,
    contentType,
    contentEncoding
  };
  message.attachments.push(attachment);
}

function log(entry, level, message, stacktrace, traceId)  {
  let msg = { level, message, stacktrace, traceId, attachments: [], id: uuid(), timestamp: Date.now() };
  entry.messages.push(msg);
  return msg;
};

function addHeader(entry, key, value) {
  entry.headers.push(R.objOf(key, value))
}

function startTrace(name, parentTrace) {
  return {
    id: uuid(),
    name,
    parentId: parentTrace && parentTrace.id,
    timestamp: Date.now()
  };
}

function finalize(entry) {
  let level = logMaxLevel(entry);

  return R.mergeRight(entry, {
    duration: Date.now() - entry.timestamp,
    level,
    levelCategory: levelCategory(level)
  });
}

class DieScheiteTracer {
  constructor (logger, name, parentTracer) {
    this.logger = logger;
    this.name = name;
    this.id = uuid();
    this.parentTracer = parentTracer;

    this.addHeader = this.logger.addHeader.bind(this.logger);
    this.info = this.logger.info.bind(this);
    this.debug = this.logger.debug.bind(this);
    this.warning = this.logger.warning.bind(this);
    this.error = this.logger.error.bind(this);
    this.critical = this.logger.critical.bind(this);
  }

  log (level, message, stacktrace) {
    let msg = log(this.logger.entry, level, message, stacktrace, this.id);
    return new DieScheiteAttacher(this, msg);
  }

  run (action) {
    let start = Date.now();
    return new Promise((resolve, reject) => {
        try {
          Promise.resolve(action(this)).then(resolve).catch(reject);
        } catch (e) {
          reject(e);
        }
      })
      .then(R.tap(() => this.logger.entry.trace.push({
        id: this.id,
        name: this.name,
        parentId: this.parentTracer && this.parentTracer.id,
        timestamp: start,
        duration: Date.now() - start
      })));
  }

  trace (name, action) {
    return new DieScheiteTracer(this.logger, name, this).run(action);
  }
}

class DieScheiteAttacher {
  constructor (logger, message) {
    this.logger = logger;
    this.message = message;

    this.addHeader = this.logger.addHeader.bind(this.logger);
    this.log = this.logger.log.bind(this.logger);
    this.debug = this.logger.debug.bind(this.logger);
    this.info = this.logger.info.bind(this.logger);
    this.warning = this.logger.warning.bind(this.logger);
    this.error = this.logger.error.bind(this.logger);
    this.critical = this.logger.critical.bind(this.logger);
  }

  attach (name, body, contentType, contentEncoding) {
    attach(this.message, name, body, contentType, contentEncoding);
    return this;
  }
}

class DieScheiteLogger {
  constructor (entry) {
    this.entry = entry;
  }

  addHeader (key, value) {
    addHeader(this.entry, key, value);
    return this;
  }

  log (level, message, stacktrace) {
    let msg = log(this.entry, level, message, stacktrace);
    return new DieScheiteAttacher(this, msg);
  }

  debug (message) {
    return this.log(LEVELS.DEBUG, message, undefined);
  }

  info (message) {
    return this.log(LEVELS.INFO, message, undefined);
  }

  warning (message) {
    log(this.entry, LEVELS.WARNING, message, undefined);
    return this;
  }

  error (message, stacktrace) {
    return this.log(LEVELS.ERROR, message, stacktrace);
  }

  critical (message, stacktrace) {
    log(this.entry, LEVELS.CRITICAL, message, stacktrace);
    return this;
  }

  trace (name, action) {
    return new DieScheiteTracer(this, name).run(action);
  }
}

function publish(entry) {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log(JSON.stringify(entry, null, 2));
      resolve({});
    }, 0);
  });
}

module.exports = function (config) {
  let serviceInfo = R.pick([ 'serviceId', 'serviceInstanceId', 'serviceVersion' ], config);

  function loggedAction(scope, action) {
    let scopeInfo = R.pick([ 'id', 'parentId', 'correlationId', 'protocol', 'route' ], scope);

    let entry = R.pipe(
      R.mergeRight(serviceInfo),
      R.mergeRight(scopeInfo),
      R.mergeRight({
        headers: [],
        messages: [],
        trace: [],
        timestamp: Date.now(),
      })
    )({});

    return Promise.resolve(action(new DieScheiteLogger(entry)))
      .then(result => ({ result, published: publish(finalize(entry)) }));
  }

  return {
    loggedAction
  };
};
