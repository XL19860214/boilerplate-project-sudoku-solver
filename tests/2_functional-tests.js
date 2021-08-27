const chai = require("chai");
const chaiHttp = require('chai-http');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

const async = require('async');

const { puzzlesAndSolutions } = require('../controllers/puzzle-strings.js');
const { invalidPuzzlesAndSolutions } = require('../controllers/invalid-puzzle-strings.js');

suite('Functional Tests', () => {

  suite('Route /api/solve Tests', () => {
    // #1
    test('Solve a puzzle with valid puzzle string: POST request to /api/solve', done => {
      async.each(puzzlesAndSolutions, (puzzleAndSolution, callback) => {
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
      }, err => done());
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
          });
      done();
    });


    // #3
    test('Solve a puzzle with invalid characters: POST request to /api/solve', done => {
      const puzzleStringsWithInvalidCharacters = amount => {
        const invalidCharacters = '0abcdefghijklmnopqrstuvwxyz';
        const puzzleStrings = [];
        let i = 0;
        while (i < amount) {
          puzzleStrings.push(invalidCharacters[Math.floor(Math.random() * invalidCharacters.length)].repeat(81));
          i++;
        }

        return puzzleStrings;
      };

      async.each(puzzleStringsWithInvalidCharacters(100), (puzzleStringWithInvalidCharacters, callback) => {
       chai.request(server)
            .post('/api/solve')
            .send({
              puzzle: puzzleStringWithInvalidCharacters
            })
            .end((err, res)=> {
              assert.isNull(err);
              assert.equal(res.status, 200);
              assert.equal(res.body.error, 'Invalid characters in puzzle');
            });
      }, err => done());

      done();
    });

  });


});

