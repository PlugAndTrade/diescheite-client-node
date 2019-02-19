# NodeJS Die Scheite client
NodeJS Die Scheite client.

## Documentation

### Overview
This library is implemented with [nact](https://github.com/ncthbrt/nact), basic actor pattern suuport library. This
forces the user of this library to be minimally aware of `nact`. The minimum requirement is as follows:

```
const { start } = require('nact');
const actSystem = start(); // Start the nact system.
```

If the nact system is not started no actions will be performed on Die Scheite primitives.

### Publishers

#### Console Publisher

A simple publisher writing entries as json to stdout is available.

Example:
```
const publisher = DieScheite.publishers.console.start(actSystem);
const prettyPublisher = DieScheite.publishers.console.start(actSystem, { pretty: true });
```

It takes the optioanl `pretty` argument, if set to `true` it will stringify entries with
`JSON.stringify(entry, null, 2)`.

#### Custom publishers

A publisher is a `nact` process handling the `PUBLISH` message type, `{ type: 'PUBLISH', entry: { /* ... */ } }`. The
entry contains the entire log entry object. The publish action on a publisher process must respond with a promise,
resolving after successful publish, to the sender.

Example publisher writing each log entry to stdout with a `pretty` option:
```
const { spawn } = require('nact');

function createPublisher(actorParent, opts) {
  return spawn(
    actorParent,
    (state, msg, ctx) => {
      if (msg.type === 'PUBLISH') {
        let data = JSON.stringify(entry, null, state.pretty ? 2 : null);
        dispatch(
          ctx.sender,
          new Promise((resolve) => setImmediate(() => {
            console.log(data);
            resolve();
          }))
        );
      }
      return state;
    },
    uuid(), // Publisher process id
    { initialState: opts }
  );
}
```

### Logged Action

A full example is found [here](examples/console.js). The fundamentals are:

```
const DieScheite = require('../index'),
      { start } = require('nact'),

const actSystem = start();
const logPublisher = DieScheite.publishers.console.start(actSystem);

const ds = DieScheite.generic(
  {
    serviceId: 'example-console',
    serviceVersion: '0.1.0',
    serviceInstanceId: '01'
  },
  logPublisher
);

ds.loggedAction(tracingScope.generic({}), entry => {
    // Do your work here
    entry.info("Some info log...");
    return 1;
  })
  .then({ result } => result === 1); // true
```

### Express

```
const express = require('express'),
      { start } = require('nact'),
      DieScheite = require('../index');

const actSystem = start();
const logPublisher = DieScheite.publishers.console.start(actSystem, { pretty: true }); // Pretty print json

const app = express();

app.use(DieScheite.express.middleware(
  {
    serviceId: 'example-express',
    serviceVersion: '0.1.0',
    serviceInstanceId: '01',
    publisher,
    ignoredRoutes: [ '/healthcheck', /ignored/ ],
    ignoredHeaders: [ 'date' ],
    censoredHeaders: [ 'user-agent', 'foo' ]
  },
  app,
));

/*
...
...
*/

app.use(DieScheite.express.errorHandler);

app.listen(3000, (...args) => {
  // ...
});
```
