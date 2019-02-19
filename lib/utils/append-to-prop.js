const R = require('ramda');

module.exports = prop => R.flip(R.uncurryN(2, obj => R.over(R.lensProp(prop), R.append(obj))));

