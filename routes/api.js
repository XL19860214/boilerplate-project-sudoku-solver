'use strict';

const SudokuSolver = require('../controllers/sudoku-solver.js');

module.exports = function (app) {
  
  let solver = new SudokuSolver();

  app.route('/api/check')
    .post((req, res) => {

    });
    
  app.route('/api/solve')
    .post((req, res) => {
      if (!req.body.puzzle) {
        return res.json({ error: 'Required field missing' })
      }
      
      const solution = solver.solve(req.body.puzzle);
      res.json({
        solution
      });
    });
};
