const R = require('ramda'),
      { query } = require('nact');
      promiseAll = require('./promise-all');

module.exports = R.uncurryN(2, (action) => R.pipe(
  R.prop('children'),
  R.invoker(0, 'values'),
  Array.from,
  R.map(c => query(c, { type: action }, 100)),
  promiseAll
));
