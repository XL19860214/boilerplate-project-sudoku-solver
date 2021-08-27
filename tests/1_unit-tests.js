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
    test('Logic handles an invalid row placement', done => {
      puzzlesAndSolutions.forEach(puzzleAndSolution => {
        let i = 0;
        while (i < 9) {
          let rowString = puzzleAndSolution[0].slice(i * 9, (i + 1) * 9);
          let waitingInvalidPlacements = validPlacementString.split('').filter(validPlacement => {
            if (validPlacement === '.') return false;
            return rowString.indexOf(validPlacement) !== -1;
          });

          rowString.split('').forEach((placeholder, column) => {
            waitingInvalidPlacements.forEach(waitingInvalidPlacement => {
              // Skip the same
              if (placeholder === waitingInvalidPlacement) {
                return;
              }
              assert.isFalse(solver.checkRowPlacement(puzzleAndSolution[0], i, column, waitingInvalidPlacement), `Input ${waitingInvalidPlacement} to position ${column} in ${rowString} should be an invalid row placement.`);
            });
          });
          i++;
        }
      });
      done();
    });

    // #6
    test('Logic handles a valid column placement', done => {
      puzzlesAndSolutions.forEach(puzzleAndSolution => {
        let i = 0;
        while (i < 9) {
          let j = 0;
          let columnString = '';
          while (j < 9) {
            columnString = columnString.concat(puzzleAndSolution[0][j * 9 + i]);
            j++;
          }
          let waitingValidPlacements = validPlacementString.split('').filter(validPlacement => {
            if (validPlacement === '.') return false;
            return columnString.indexOf(validPlacement) === -1;
          });

          columnString.split('').forEach((placeholder, row) => {
            waitingValidPlacements.forEach(waitingValidPlacement => {
              assert.isTrue(solver.checkColPlacement(puzzleAndSolution[0], row, i, waitingValidPlacement), `Input ${waitingValidPlacement} to position ${row} in ${columnString} should be a valid column placement.`);
            });
          });
          i++;
        }
      });
      done();
    });

    // #7
    test('Logic handles an invalid column placement', done => {
      puzzlesAndSolutions.forEach(puzzleAndSolution => {
        let i = 0;
        while (i < 9) {
          let j = 0;
          let columnString = '';
          while (j < 9) {
            columnString = columnString.concat(puzzleAndSolution[0][j * 9 + i]);
            j++;
          }
          let waitingInvalidPlacements = validPlacementString.split('').filter(validPlacement => {
            if (validPlacement === '.') return false;
            return columnString.indexOf(validPlacement) !== -1;
          });
          // console.log(`columnString`, columnString); // DEBUG
          // console.log(`waitingInvalidPlacements`, waitingInvalidPlacements); // DEBUG

          columnString.split('').forEach((placeholder, row) => {
            waitingInvalidPlacements.forEach(waitingInvalidPlacement => {
              // console.log(`Input ${waitingInvalidPlacement} to position ${row} in ${columnString} should be an invalid column placement.`); // DEBUG
              // Skip the same
              if (placeholder === waitingInvalidPlacement) {
                return;
              }
              assert.isFalse(solver.checkColPlacement(puzzleAndSolution[0], row, i, waitingInvalidPlacement), `Input ${waitingInvalidPlacement} to position ${row} in ${columnString} should be an invalid column placement.`);
            });
          });
          i++;
        }
      });
      done();
    });


    // #8
    test('Logic handles a valid region (3x3 grid) placement', done => {
      const step = 3;
      puzzlesAndSolutions.forEach(puzzleAndSolution => {
        let i = 0;
        while (i < 9) {
          let y = Math.floor(i / step) * step;
          let x = (i % step) * step;
          let regionString = '';
          let j = 0;
          while (j < step) {
            let k = 0;
            while (k < step) {
              let index = (y + j) * 9 + x + k;
              // console.log(`puzzleAndSolution[0][index]`, puzzleAndSolution[0][index]); // DEBUG
              regionString = regionString.concat(puzzleAndSolution[0][index]);
              k++;
            }
            j++;
          }
          // console.log(`puzzleString ${puzzleAndSolution[0]}`, `regionString ${regionString}`); // DEBUG
          let waitingValidPlacements = validPlacementString.split('').filter(validPlacement => {
            if (validPlacement === '.') return false;
            return regionString.indexOf(validPlacement) === -1;
          });

          regionString.split('').forEach((placeholder, pos) => {
            waitingValidPlacements.forEach(waitingValidPlacement => {
              let row = y + Math.floor(pos / step);
              let column = x + pos % step;
              assert.isTrue(solver.checkRegionPlacement(puzzleAndSolution[0], row, column, waitingValidPlacement), `Input ${waitingValidPlacement} to position ${pos} (${row}, ${column}) in ${regionString} should be a valid region placement.`);
            });
          });
          i++;
        }
      });
      done();
    });

  })


});
