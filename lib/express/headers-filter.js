const R = require('ramda');

module.exports = (censoredHeaders, ignoredHeaders) => R.pipe(
  R.omit(ignoredHeaders),
  R.mapObjIndexed((val, key) => key in censoredHeaders ? '<censored>' : val)
);
