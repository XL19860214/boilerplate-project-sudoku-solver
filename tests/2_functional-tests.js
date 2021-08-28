const chai = require("chai");
const chaiHttp = require('chai-http');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

const async = require('async');

const { puzzlesAndSolutions } = require('../controllers/puzzle-strings.js');
const { invalidPuzzlesAndSolutions } = require('../controllers/invalid-puzzle-strings.js');

String.prototype.randomChar = function() {
  return this[Math.floor(Math.random() * this.length)];
};

class SudokuString extends String {
  
  rowNumberFromRowText(rowText) {
    const rowString = 'ABCDEFGHI';
    return rowString.indexOf(rowText);
  }

  columnNumberFromColumnText(columnText) {
    return parseInt(column) - 1;
  }

  indexToRowNumber(index) {
    return Math.floor(index / 9);
  }

  indexToColumnNumber(index) {
    return index % 9;
  }
}

suite('Functional Tests', () => {

  suite('Route /api/solve Tests', () => {

    // =============================================================
    // /api/solve

    // #1
    test('Solve a puzzle with valid puzzle string: POST request to /api/solve', done => {
      async.eachSeries(puzzlesAndSolutions, (puzzleAndSolution, callback) => {
        chai.request(server)
          .post('/api/solve')
          .send({
            puzzle: puzzleAndSolution[0]
          })
          .end((err, res)=> {
            callback(err);
            assert.isNull(err);
            assert.equal(res.status, 200);
            assert.equal(res.body.solution, puzzleAndSolution[1]);
          });
      }, err => {
        done();
      });
    });

    // #2
    test('Solve a puzzle with missing puzzle string: POST request to /api/solve', done => {
      chai.request(server)
          .post('/api/solve')
          .send()
          .end((err, res)=> {
            assert.isNull(err);
            assert.equal(res.status, 200);
            assert.equal(res.body.error, 'Required field missing');
            done();
          });
    });


    // #3
    test('Solve a puzzle with invalid characters: POST request to /api/solve', done => {
      const puzzleStringsWithInvalidCharacters = amount => {
        const invalidCharacters = '0abcdefghijklmnopqrstuvwxyz';
        const puzzleStrings = [];
        let i = 0;
        while (i < amount) {
          puzzleStrings.push(invalidCharacters.randomChar().repeat(81));
          i++;
        }

        return puzzleStrings;
      };

      async.eachSeries(puzzleStringsWithInvalidCharacters(10), (puzzleStringWithInvalidCharacters, callback) => {
       chai.request(server)
            .post('/api/solve')
            .send({
              puzzle: puzzleStringWithInvalidCharacters
            })
            .end((err, res)=> {
              callback(err);
              assert.isNull(err);
              assert.equal(res.status, 200);
              assert.equal(res.body.error, 'Invalid characters in puzzle');
            });
      }, err => {
        done();
      });
    });


    // #4
    test('Solve a puzzle with incorrect length: POST request to /api/solve', done => {
      const puzzleStringsWithIncorrectLength = amount => {
        const validCharacters = '123456789.';
        const puzzleStrings = [];
        let i = 0;
        while (i < amount) {
          const randomLength = Math.floor(Math.random() * 10);
          if (randomLength === 81) {
            continue;
          }
          let puzzleString = '';
          let j = 0;
          while (j < randomLength) {
            puzzleString += validCharacters.randomChar();
            j++;
          }
          puzzleStrings.push(puzzleString);
          i++;
        }

        return puzzleStrings;
      };

      async.eachSeries(puzzleStringsWithIncorrectLength(10), (puzzleStringWithIncorrectLength, callback) => {
        chai.request(server)
          .post('/api/solve')
          .send({
            puzzle: puzzleStringWithIncorrectLength
          })
          .end((err, res)=> {
            callback(err);
            assert.isNull(err);
            assert.equal(res.status, 200);
            assert.equal(res.body.error, 'Expected puzzle to be 81 characters long');
          });
      }, err => {
        done();
      });
    });

    // #5
    test('Solve a puzzle that cannot be solved: POST request to /api/solve', done => {
      async.eachSeries(invalidPuzzlesAndSolutions, (invalidPuzzleAndSolution, callback) => {
        chai.request(server)
          .post('/api/solve')
          .send({
            puzzle: invalidPuzzleAndSolution[0]
          })
          .end((err, res)=> {
            callback(err);
            assert.isNull(err);
            assert.equal(res.status, 200);
            assert.equal(res.body.error, 'Puzzle cannot be solved');
          });
      }, err => {
        done();
      });
    });

  });

  // =============================================================
  // /api/check

  suite('Route /api/check Tests', () => {
    // #6
    test('Check a puzzle placement with all fields: POST request to /api/check', done => {
      async.eachSeries(puzzlesAndSolutions, (puzzleAndSolution, callback) => {
        chai.request(server)
          .post('/api/check')
          .send({
            puzzle: puzzleAndSolution[0],
            coordinate: 'A1',
            value: '1'
          })
          .end((err, res)=> {
            callback(err);
            assert.isNull(err);
            assert.equal(res.status, 200);
          });
      }, err => {
        done();
      });
    });

    // #7
    test('Check a puzzle placement with single placement conflict: POST request to /api/check', done => {

      const makeRowConflict = puzzleString => {
        let index = 0;
        let row = 0;
        let next = false;
        let rowString;
        do {
          rowString = puzzleString.substring(index, index + 9);
          if (!rowString.includes('.')) {
            next = true;
            index += 9;
            row += 1;
          } else {
            next = false;
          }
        } while (next);

        let keep;
        let result;
        rowString.split('').forEach((rowPlaceholder, column) => {
          if (result !== undefined) {
            return;
          }
          if (keep === undefined && rowPlaceholder !== '.') {
            keep = rowPlaceholder;
          } else if (keep !== undefined && rowPlaceholder === '.') {
            result = {
              rowString: rowString,
              coordinate: 'ABCDEFGHI'[row] + (column + 1),
              value: keep
            }
          }
        });

        return result;
      };

      const makeColumnConflict = puzzleString => {
        let column = 0;
        let next = false;
        let columnString;
        do {
          columnString = '';
          let index = 0;
          while (columnString.length < 9) {
            columnString += puzzleString.substring(index + column, index + column + 1);
            index += 9;
          }
          if (!columnString.includes('.')) {
            next = true;
            
            column += 1;
          } else {
            next = false;
          }
        } while (next);

        let keep;
        let result;
        columnString.split('').forEach((columnPlaceholder, row) => {
          if (result !== undefined) {
            return;
          }
          if (keep === undefined && columnPlaceholder !== '.') {
            keep = columnPlaceholder;
          } else if (keep !== undefined && columnPlaceholder === '.') {
            result = {
              columnString: columnString,
              coordinate: 'ABCDEFGHI'[row] + (column + 1),
              value: keep
            }
          }
        });

        return result;
      };

      const makeRegionConflict = puzzleString => {
        let step = 0;
        let next = false;
        let regionString;
        do {
          regionString = '';
          let rowStart = Math.floor(step / 3);
          let columnStart = (step % 3) * 3;
          
          while (regionString.length < 9) {
            let level = 0;
            while (level < 3) {
              let pickStart = (rowStart + level) * 9 + columnStart;
              regionString += puzzleString.substring(pickStart, pickStart + 3);
              level++;
            }
          }
          if (!regionString.includes('.')) {
            next = true;
            step += 1;
          } else {
            next = false;
          }
        } while (next);

        let keep;
        let result;
        regionString.split('').forEach((regionPlaceholder, pos) => {
          if (result !== undefined) {
            return;
          }
          if (keep === undefined && regionPlaceholder !== '.') {
            keep = regionPlaceholder;
          } else if (keep !== undefined && regionPlaceholder === '.') {
            const rowStart = Math.floor(step / 3);
            const columnStart = (step % 3) * 3;
            const level = Math.floor(pos / 3);
            const row = rowStart + level;
            const column = columnStart + (pos % 3);
            result = {
              columnString: regionString,
              coordinate: 'ABCDEFGHI'[row] + (column + 1),
              value: keep
            }
          }
        });

        return result;
      };

      async.series({
        rowConflict: cb => async.eachSeries(puzzlesAndSolutions, (puzzleAndSolution, callback) => {
          const conflict = makeRowConflict(puzzleAndSolution[0]);
          // console.log(puzzleAndSolution[0], conflict); // DEBUG

          chai.request(server)
            .post('/api/check')
            .send({
              puzzle: puzzleAndSolution[0],
              coordinate: conflict.coordinate,
              value: conflict.value
            })
            .end((err, res)=> {
              callback(err);
              assert.isNull(err);
              assert.equal(res.status, 200);
              assert.isFalse(res.body.valid);
              assert.include(res.body.conflict, 'row');
            });
        }, err => {
          cb(err, 'done');
        }),
        columnConflict: cb => async.eachSeries(puzzlesAndSolutions, (puzzleAndSolution, callback) => {
          const conflict = makeColumnConflict(puzzleAndSolution[0]);
          // console.log(puzzleAndSolution[0], conflict); // DEBUG

          chai.request(server)
            .post('/api/check')
            .send({
              puzzle: puzzleAndSolution[0],
              coordinate: conflict.coordinate,
              value: conflict.value
            })
            .end((err, res)=> {
              callback(err);
              assert.isNull(err);
              assert.equal(res.status, 200);
              assert.isFalse(res.body.valid);
              assert.include(res.body.conflict, 'column');
            });
        }, err => {
          cb(null, 'done');
        }),
        regionConflict: cb => async.eachSeries(puzzlesAndSolutions, (puzzleAndSolution, callback) => {
          const conflict = makeRegionConflict(puzzleAndSolution[0]);
          console.log(puzzleAndSolution[0], conflict); // DEBUG

          chai.request(server)
            .post('/api/check')
            .send({
              puzzle: puzzleAndSolution[0],
              coordinate: conflict.coordinate,
              value: conflict.value
            })
            .end((err, res)=> {
              callback(err);
              assert.isNull(err);
              assert.equal(res.status, 200);
              assert.isFalse(res.body.valid);
              assert.include(res.body.conflict, 'region');
            });
        }, err => {
          cb(null, 'done');
        })
      })
      .then(results => {
        done();
      });
    });

  });


});

