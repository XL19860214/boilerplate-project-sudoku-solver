const chai = require("chai");
const chaiHttp = require('chai-http');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

const async = require('async');
const _ = require('lodash');

const { puzzlesAndSolutions } = require('../controllers/puzzle-strings.js');
const { invalidPuzzlesAndSolutions } = require('../controllers/invalid-puzzle-strings.js');

String.prototype.randomChar = function() {
  return this[Math.floor(Math.random() * this.length)];
};

// -------------------------------------------------------------
// 

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

// -------------------------------------------------------------
// 

class SudokuCell extends String {

  constructor(str, index) {
    super(str[index]);
    this.sudokuString = new SudokuString(str);
    this.index = index;
  }

  get rowText() {
    return 'ABCDEFGHI'[this.rowNumber];
  }

  get rowNumber() {
    return this.sudokuString.indexToRowNumber(this.index);
  }

  get columnText() {
    return (this.columnNumber + 1).toString();
  }

  get columnNumber() {
    return this.sudokuString.indexToColumnNumber(this.index);
  }

  get coordinate() {
    return this.rowText + this.columnText;
  }

  // 0 1 2
  // 3 4 5
  // 6 7 8
  get regionStep() {
    const row = this.rowNumber;
    const column = this.columnNumber;

    return Math.floor(row / 3) * 3 + Math.floor(column / 3);
  }

  get regionRowStart() {
    return Math.floor(this.regionStep / 3) * 3;
  }

  get regionColumnStart() {
    return (this.regionStep % 3) * 3;
  }

  get regionX() {
    return this.columnNumber - this.regionColumnStart;
  }

  get regionY() {
    return this.rowNumber - this.regionRowStart;
  }

  get rowString() {
    const start = this.rowNumber * 9;
    return this.sudokuString.substring(start, start + 9);
  }

  get columnString() {
    let columnString = '';
    let index = 0;
    const column = this.columnNumber;
    while (columnString.length < 9) {
      columnString += this.sudokuString.substring(index + column, index + column + 1);
      index += 9;
    }

    return columnString;
  }

  get regionString() {
    let step = this.regionStep;
    let regionString = '';
    const rowStart = this.regionRowStart;
    const columnStart = this.regionColumnStart;
    
    while (regionString.length < 9) {
      let level = 0;
      while (level < 3) {
        let pickStart = (rowStart + level) * 9 + columnStart;
        regionString += this.sudokuString.substring(pickStart, pickStart + 3);
        level++;
      }
    }

    return regionString;
  }

}

// -------------------------------------------------------------
// 

class SudokuRowConflictMaker {

  constructor(sudokuCell) {
    this.sudokuCell = sudokuCell;
    this.sudokuString = sudokuCell.sudokuString;
  }

  duplicateFirstEmpty() {
    const row = this.sudokuCell.rowNumber;
    const packString = this.sudokuCell.rowString;
    let keep;
    let result;

    // Find one value to duplicate
    packString.split('').some((placeholder, column) => {
      if (keep === undefined && placeholder !== '.') {
        keep = placeholder;
        return true;
      }
    });

    if (keep !== undefined) {
      packString.split('').some((placeholder, column) => {
        if (placeholder === '.') {
          result = {
            packString,
            conflict: 'row',
            coordinate: 'ABCDEFGHI'[row] + (column + 1),
            value: keep
          }
          return true;
        }
      });
    }
  
    return result;
  }
  
}

// -------------------------------------------------------------
// 

class SudokuColumnConflictMaker {

  constructor(sudokuCell) {
    this.sudokuCell = sudokuCell;
    this.sudokuString = sudokuCell.sudokuString;
  }

  duplicateFirstEmpty() {
    const column = this.sudokuCell.columnNumber;
    const packString = this.sudokuCell.columnString;
    let keep;
    let result;

    // Find one value to duplicate
    packString.split('').some((placeholder, row) => {
      if (keep === undefined && placeholder !== '.') {
        keep = placeholder;
        return true;
      }
    });

    if (keep !== undefined) {
      packString.split('').some((placeholder, row) => {
        if (placeholder === '.') {
          result = {
            packString,
            conflict: 'column',
            coordinate: 'ABCDEFGHI'[row] + (column + 1),
            value: keep
          }
          return true;
        }
      });
    }

    return result;
  }

}

// -------------------------------------------------------------
// 

class SudokuRegionConflictMaker {
  constructor(sudokuCell) {
    this.sudokuCell = sudokuCell;
    this.sudokuString = sudokuCell.sudokuString;
  }

  duplicateFirstEmpty() {
    const column = this.sudokuCell.columnNumber;
    const packString = this.sudokuCell.regionString;
    const regionRowStart = this.sudokuCell.regionRowStart;
    const regionColumnStart = this.sudokuCell.regionColumnStart;
    let keep;
    let result;

    // Find one value to duplicate
    packString.split('').some((placeholder, pos) => {
      if (keep === undefined && placeholder !== '.') {
        keep = placeholder;
        return true;
      }
    });

    if (keep !== undefined) {
      packString.split('').some((placeholder, pos) => {
        if (placeholder === '.') {
          const level = Math.floor(pos / 3);
          const row = regionRowStart + level;
          const column = regionColumnStart + (pos % 3);
          result = {
            packString,
            conflict: 'region',
            coordinate: 'ABCDEFGHI'[row] + (column + 1),
            value: keep
          }
          return true;
        }
      });
    }

    return result;
  }
}

// ============================================================================================
// 

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
          cb(err, 'done');
        }),
        regionConflict: cb => async.eachSeries(puzzlesAndSolutions, (puzzleAndSolution, 
        callback) => {
          const conflict = makeRegionConflict(puzzleAndSolution[0]);
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
              assert.include(res.body.conflict, 'region');
            });
        }, err => {
          cb(err, 'done');
        })
      })
      .then(results => {
        done();
      });

    });

    // test('Class SudokuCell', done => {
    //   const sudokuCell = new SudokuCell(puzzlesAndSolutions[0][0], 28);
    //   console.log(`sudokuCell`, sudokuCell); // DEBUG
    //   // console.log(`row`, sudokuCell.rowNumber, `column`, sudokuCell.columnNumber); // DEBUG
    //   console.log(`Region step`, sudokuCell.regionStep,
    //     `Region row start`, sudokuCell.regionRowStart,
    //     `Region column start`, sudokuCell.regionColumnStart); // DEBUG
    //   console.log(`Region string`, sudokuCell.regionString); // DEBUG

    //   done();
    // });

    // test('Class SudokuRowConflictMaker', done => {
    //   const sudokuCell = new SudokuCell(puzzlesAndSolutions[0][0], 6);
    //   const sudokuRowConflictMaker = new SudokuRowConflictMaker(sudokuCell);
    //   const rowConflict = sudokuRowConflictMaker.duplicateFirstEmpty();

    //   console.log(`sudokuCell`, sudokuCell); // DEBUG
    //   console.log(`rowString`, sudokuCell.rowString); // DEBUG
    //   console.log(`rowConflict`, rowConflict); // DEBUG


    //   done();
    // });

    // test('Class SudokuColumnConflictMaker', done => {
    //   const sudokuCell = new SudokuCell(puzzlesAndSolutions[0][0], 0);
    //   const sudokuColumnConflictMaker = new SudokuColumnConflictMaker(sudokuCell);
    //   const conflict = sudokuColumnConflictMaker.duplicateFirstEmpty();

    //   console.log(`sudokuCell`, sudokuCell); // DEBUG
    //   console.log(`conflict`, conflict); // DEBUG


    //   done();
    // });

    // test('Class SudokuRegionConflictMaker', done => {
    //   const sudokuCell = new SudokuCell(puzzlesAndSolutions[0][0], 3);
    //   const sudokuRegionConflictMaker = new SudokuRegionConflictMaker(sudokuCell);
    //   const conflict = sudokuRegionConflictMaker.duplicateFirstEmpty();

    //   console.log(`sudokuCell`, sudokuCell); // DEBUG
    //   console.log(`conflict`, conflict); // DEBUG


    //   done();
    // });

    // #8
    test('Check a puzzle placement with multiple placement conflicts: POST request to /api/check', done => {
      // const types = ['row', 'column', 'region'];
      // const multipleConflictsTypes = [
      //   ['row', 'column'],
      //   ['row', 'region'],
      //   ['column', 'region']
      // ];

      const multipleConflictMaker = puzzleString => {
        let result;

        puzzleString.split('').some((char, index, arr) => {
          const sudokuCell = new SudokuCell(puzzleString, index);
          // console.log(`sudokuCell`, sudokuCell); // DEBUG
          // const sudokuRowConflictMaker = new SudokuRowConfliceMaker(cell);
          // const sudokuColumnConflictMaker = new SudokuColumnConflictMaker(cell);
          // const sudokuRegionConflictMaker = new SudokuRegionConflictMaker(cell);
          const rowString = sudokuCell.rowString;
          const rowNumbersArray = rowString.replace(/\./g, '').split('');
          const columnString = sudokuCell.columnString;
          const columnNumbersArray = columnString.replace(/\./g, '').split('');
          const regionString = sudokuCell.regionString;
          const regionNumbersArray = regionString.replace(/\./g, '').split('');

          // console.log(`rowString`, rowString); // DEBUG
          // console.log(`columnString`, columnString); // DEBUG
          // console.log(`regionString`, regionString); // DEBUG

          const rowColumnIntersection = _.intersection(rowNumbersArray, columnNumbersArray);
          const rowRegionIntersection = _.intersection(rowNumbersArray, regionNumbersArray);
          const columnRegionIntersection = _.intersection(columnNumbersArray, regionNumbersArray);

          // console.log(`rowColumnIntersection`, rowColumnIntersection); // DEBUG
          // console.log(`rowRegionIntersection`, rowRegionIntersection); // DEBUG
          // console.log(`columnRegionIntersection`, columnRegionIntersection); // DEBUG

          if (rowColumnIntersection.length > 0) {
            if (rowRegionIntersection.length === 0) {
              result = {
                rowString,
                columnString,
                conflicts: ['row', 'column'],
                coordinate: sudokuCell.coordinate,
                value: rowColumnIntersection[0],
              };
              return true;
            }
          } else if (rowRegionIntersection.length > 0) {
            if (columnRegionIntersection.length === 0) {
              result = {
                rowString,
                regionString,
                conflicts: ['row', 'region'],
                coordinate: sudokuCell.coordinate,
                value: rowRegionIntersection[0],
              };
              return true;
            }
          } else if (columnRegionIntersection.length > 0) {
            result = {
                columnString,
                regionString,
                conflicts: ['column', 'region'],
                coordinate: sudokuCell.coordinate,
                value: columnRegionIntersection[0],
              };
              return true;
          }
        });

        return result;
      }

      async.eachSeries(puzzlesAndSolutions, (puzzleAndSolution, callback) => {
          const conflict = multipleConflictMaker(puzzleAndSolution[0]);
          // console.log(puzzleAndSolution[0], conflict); // DEBUG

          if (conflict === undefined) {
            return callback(null);
          }

          chai.request(server)
            .post('/api/check')
            .send({
              puzzle: puzzleAndSolution[0],
              coordinate: conflict.coordinate,
              value: conflict.value
            })
            .end((err, res)=> {
              callback(err);
              // console.log(`res.body`, res.body); // DEBUG
              assert.isNull(err);
              assert.equal(res.status, 200);
              assert.isFalse(res.body.valid);
              assert.isArray(res.body.conflict);
              assert.includeMembers(res.body.conflict, conflict.conflicts);
            });
        }, err => {
          done();
        });

    });

  });


});

