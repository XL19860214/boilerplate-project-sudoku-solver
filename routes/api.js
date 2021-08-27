'use strict';

const SudokuSolver = require('../controllers/sudoku-solver.js');

module.exports = function (app) {
  
  let solver = new SudokuSolver();

  app.route('/api/check')
    .post((req, res) => {

    });
    
  app.route('/api/solve')
    .post((req, res) => {
      if (req.body.puzzle === undefined) {
        return res.json({ error: 'Required field missing' });
      }

      // Invalid puzzle string
      if (!solver.validate(req.body.puzzle)) {
        if(/[^1-9\.]/.test(req.body.puzzle)) {
          return res.json({ error: 'Invalid characters in puzzle' });
        } else if (req.body.puzzle.length !== 81) {
          return res.json({ error: 'Expected puzzle to be 81 characters long' });
        }
      }
      
      const solution = solver.solve(req.body.puzzle);
      res.json({
        solution
      });
    });
};
