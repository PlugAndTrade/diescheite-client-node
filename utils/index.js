const R = require('ramda'),
      uuid = require('uuid/v4'),
      { spawn, query } = require('nact');

const promiseAll = ps => Promise.all(ps);
const appendToProp = prop => R.flip(R.uncurryN(2, obj => R.over(R.lensProp(prop), R.append(obj))));

const queryChildren = R.uncurryN(2, (action) => R.pipe(
  R.prop('children'),
  R.invoker(0, 'values'),
  Array.from,
  R.map(c => query(c, { type: action }, 100)),
  promiseAll
));

function spawnHelper(parent, actions, initialState) {
  return spawn(
    parent,
    (state, msg, ctx) => {
      if (!actions[msg.type]) {
        throw new Error(`Unknown action: ${msg.type}`)
      }
      return actions[msg.type](state, msg, ctx)
    },
    initialState.id || uuid(),
    { initialState }
  );
}

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
  spawnHelper,
  queryChildren,
  promiseAll,
  appendToProp
};
