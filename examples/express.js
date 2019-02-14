const express = require('express'),
      R = require('ramda'),
      { start, stop } = require('nact'),
      tracingScope = require('../tracingScope'),
      DieScheite = require('../index');

const actSystem = start();
const ds = DieScheite({
  actorParent: actSystem,
  serviceId: 'example-console',
  serviceVersion: '0.1.0',
  serviceInstanceId: '01'
});

const app = express();

app.use(ds.expressMiddleware);

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

fooRouter.use('/:fooId', (req, res, next) => {
  next();
  res.send(JSON.stringify(R.mergeRight(req.foo, { fooId: req.params.fooId })));
});

const subRouter = express.Router();

subRouter.use('/:subId', (req, res, next) => {
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

router.use('/:id/sub', (req, res, next) => {
  next();
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

app.use(ds.expressErrorHandler);

app.listen(3000, (...args) => {
  console.log("Listening...");
});
