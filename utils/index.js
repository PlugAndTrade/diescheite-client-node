const R = require('ramda');

const logMaxLevel = R.pipe(
  R.prop('messages'),
  R.map(R.prop('level')),
  R.reduce(R.max, 0)
);

const LEVELS = {
  DEBUG: 100,
  INFO: 200,
  WARNING: 300,
  ERROR: 400,
  CRITICAL: 500,
};

const levelCategories = {
  0: '',
  1: 'DEBUG',
  2: 'INFO',
  3: 'WARNING',
  4: 'ERROR',
  5: 'CRITICAL'
};

const levelCategory = R.pipe(
  R.divide(R.__, 100),
  Math.floor,
  R.cond([
    [ R.gte(5), R.prop(R.__, levelCategories) ],
    [ R.T, R.toString ]
  ])
);

module.exports = {
  logMaxLevel,
  LEVELS,
  levelCategories,
  levelCategory,
  spawnHelper: require('./spawn-helper'),
  queryChildren: require('./query-children'),
  promiseAll: require('./promise-all'),
  appendToProp: require('./append-to-prop')
};
