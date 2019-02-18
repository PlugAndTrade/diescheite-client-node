const R = require('ramda'),
      values = require('./values'),
      names = require('./names');

const categoryValue = R.pipe(R.divide(R.__, 100), Math.floor);

const categories = R.pipe(
  R.toPairs,
  R.map(R.pipe(
    R.over(R.lensIndex(0), R.propOr('', R.__, names)),
    R.over(R.lensIndex(1), categoryValue),
    R.reverse
  )),
  R.fromPairs
)(values);

module.exports = R.pipe(
  categoryValue,
  R.propOr('', R.__, categories)
);
