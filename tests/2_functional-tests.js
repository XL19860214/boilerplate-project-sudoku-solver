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

  });


});

