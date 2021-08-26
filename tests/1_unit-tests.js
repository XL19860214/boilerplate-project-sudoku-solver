const chai = require('chai');
const assert = chai.assert;

const Solver = require('../controllers/sudoku-solver.js');
// let solver;
const solver = new Solver();

const validPlacement = '123456789.';

const { puzzlesAndSolutions } = require('../controllers/puzzle-strings.js');

suite('UnitTests', () => {
  // #1
  test('Logic handles a valid puzzle string of 81 characters', done => {

    puzzlesAndSolutions.forEach(puzzleAndSolution => {
      assert.isTrue(solver.validate(puzzleAndSolution[0]));
    })

    done();

  });


});
