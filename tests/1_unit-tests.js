const chai = require('chai');
const assert = chai.assert;

const Solver = require('../controllers/sudoku-solver.js');
// let solver;
const solver = new Solver();

const validPlacementString = '123456789.';

const { puzzlesAndSolutions } = require('../controllers/puzzle-strings.js');

suite('UnitTests', () => {
  // #1
  test('Logic handles a valid puzzle string of 81 characters', done => {

    puzzlesAndSolutions.forEach(puzzleAndSolution => {
      assert.isTrue(solver.validate(puzzleAndSolution[0]));
    })

    done();
  });

  // #2
  test('Logic handles a puzzle string with invalid characters (not 1-9 or .)', done => {
    puzzlesAndSolutions.forEach(puzzleAndSolution => {
      let modifiedPuzzleString = puzzleAndSolution[0];
      validPlacementString.split('').forEach(validPlacement => {
        if (puzzleAndSolution[0].indexOf(validPlacement) !== -1) {
          modifiedPuzzleString = puzzleAndSolution[0].replace(validPlacement, String.fromCharCode(validPlacement.charCodeAt(0) + 9 + Math.ceil(Math.random() * 10)))
        }
      })
      // console.log(`modifiedPuzzleString`, modifiedPuzzleString); // DEBUG
      assert.isFalse(solver.validate(modifiedPuzzleString));
    })

    done();
  });


});
