const chai = require("chai");
const chaiHttp = require('chai-http');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

const { puzzlesAndSolutions } = require('../controllers/puzzle-strings.js');
const { invalidPuzzlesAndSolutions } = require('../controllers/invalid-puzzle-strings.js');

suite('Functional Tests', () => {

  suite('Route /api/solve Tests', () => {
    // #1
    test('Solve a puzzle with valid puzzle string: POST request to /api/solve', done => {
      puzzlesAndSolutions.forEach(puzzleAndSolution => {
        chai.request(server)
            .post('/api/solve')
            .send({
              puzzle: puzzleAndSolution[0]
            })
            .end((err, res)=> {
              assert.isNull(err);
              assert.equal(res.body.solution, puzzleAndSolution[1]);
            });
      });

      done();
    });
  });

});

