const chai = require('chai');
const assert = chai.assert;

const Solver = require('../controllers/sudoku-solver.js');
// let solver;
const solver = new Solver();

const validPlacementString = '123456789.';
const randomValidPlacement = () => {
  const index = Math.floor(Math.random() * validPlacementString.length);
  return validPlacementString[index];
}

const { puzzlesAndSolutions } = require('../controllers/puzzle-strings.js');

suite('UnitTests', () => {

  suite('Solver::validate() Tests', () => {
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
            modifiedPuzzleString = puzzleAndSolution[0].replace(validPlacement, String.fromCharCode(validPlacement.charCodeAt(0) + 12 + Math.ceil(Math.random() * 10)))
          }
        })
        // console.log(`modifiedPuzzleString`, modifiedPuzzleString); // DEBUG
        assert.isFalse(solver.validate(modifiedPuzzleString), modifiedPuzzleString);
      })

      done();
    });

    // #3
    test('Logic handles a puzzle string that is not 81 characters in length', done => {
      let i = 1;
      while (i < 100) {
        let puzzleString = randomValidPlacement().repeat(i);
        if (i !== 81) {
          assert.isFalse(solver.validate(puzzleString));
        } else {
          assert.isTrue(solver.validate(puzzleString));
        }
        i++;
      }
      done();
    });
  })

  suite('Row, Column and Region Tests', () => {
    // #4
    test('Logic handles a valid row placement', done => {
      puzzlesAndSolutions.forEach(puzzleAndSolution => {
        let i = 0;
        while (i < 9) {
          let rowString = puzzleAndSolution[0].slice(i * 9, (i + 1) * 9);
          let waitingValidPlacements = validPlacementString.split('').filter(validPlacement => {
            if (validPlacement === '.') return false;
            return rowString.indexOf(validPlacement) === -1;
          });

          rowString.split('').forEach((placeholder, column) => {
            waitingValidPlacements.forEach(waitingValidPlacement => {
              assert.isTrue(solver.checkRowPlacement(puzzleAndSolution[0], i, column, waitingValidPlacement), `Input ${waitingValidPlacement} to position ${column} in ${rowString} should be a valid row placement.`);
            });
          });
          i++;
        }
      });
      done();
    });

    // #5
    // test('Logic handles an invalid row placement', done => {

    // });


  })


});
