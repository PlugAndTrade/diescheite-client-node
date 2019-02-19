const express = require('express'),
      DieScheite = require('../index');

const actSystem = DieScheite.start();
const publisher = DieScheite.publishers.console.start(actSystem, { pretty: true });

const app = express();

app.use(DieScheite.express.middleware(
  {
    serviceId: 'example-express',
    serviceVersion: '0.1.0',
    serviceInstanceId: '01',
    publisher,
    ignoredRoutes: [ '/healthcheck', /ignored/ ],
    censoredHeaders: [ 'user-agent', 'foo' ]
  },
  app,
));

app.get('/healthcheck', (req, res) => {
  res.send("OK");
});

app.get('/one/ignored/route', (req, res) => {
  res.send("Ignored");
});

app.get('/some/other/ignored/route', (req, res) => {
  res.send("Ignored");
});

app.get('/some/other/ignored/error', (req, res) => {
  throw new Error('Ignored error');
});

app.get('/', (req, res) => {
  return req.logger.trace("send", logger => {
    res.send(JSON.stringify({foo: 'bar'}));
  });
});

app.get('/:id', (req, res) => {
  return req.logger.trace("send", logger => {
    res.send(JSON.stringify({foo: 'bar', id: req.params.id}));
  });
});

const fooRouter = express.Router();

fooRouter.get('/:fooId', (req, res) => {
  res.send(JSON.stringify(R.mergeRight(req.foo, { fooId: req.params.fooId })));
});

const subRouter = express.Router();

subRouter.get('/:subId', (req, res, next) => {
  req.foo.subId = req.params.subId;
  req.logger.info(`Got subId: ${req.params.subId}`);
  res.send(JSON.stringify({ foo: 'bar', id: req.foo.id, subId: req.params.subId }));
});

subRouter.use('/:subId/foo', fooRouter);

const router = express.Router();

router.use('/:id', (req, res, next) => {
  req.foo = { id: req.params.id };
  req.logger.info(`Got id: ${req.params.id}`);
  return next();
});

router.use('/:id/sub', subRouter);

router.get('/:id/error', (req, res) => {
  throw new Error('Aja baja!');
});

router.use('/:id/timeout', (req, res, next) => {
  setTimeout(next, 5000);
});

router.get('/:id/timeout', (req, res) => {
  res.send("Timeout");
});

app.use(router);

app.use(function (err, req, res, next) {
  res.statusCode = 500;
  res.send("Internal Server Error");
  next(err);
});

app.use(DieScheite.express.errorHandler);

app.listen(3000, (...args) => {
  console.log("Listening...");
});
