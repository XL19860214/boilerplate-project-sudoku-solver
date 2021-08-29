'use strict';

const SudokuSolver = require('../controllers/sudoku-solver.js');

module.exports = function (app) {
  
  let solver = new SudokuSolver();

  app.route('/api/check')
    .post((req, res) => {
      const puzzleString = req.body.puzzle;
      const row = solver.rowNumber(req.body.coordinate[0])
      const column = solver.columnNumber(req.body.coordinate[1]);
      const placement = req.body.value;
      // console.log(
      //   `req.body`, req.body,
      //   `row`, row,
      //   `column`, column,
      //   `placement`, placement
      // ); // DEBUG

      // Fields
      if (['puzzle', 'coordinate', 'value'].some(field => {
        if (!req.body.hasOwnProperty(field)) {
          return true;
        }
      })) {
        return res.json({ error: 'Required field(s) missing' });
      }

      // Invalid puzzle string
      if (!solver.validate(req.body.puzzle)) {
        if(/[^1-9\.]/.test(req.body.puzzle)) {
          return res.json({ error: 'Invalid characters in puzzle' });
        } else if (req.body.puzzle.length !== 81) {
          return res.json({ error: 'Expected puzzle to be 81 characters long' });
        }
      }

      const conflict = [];
      if (!solver.checkRowPlacement(puzzleString, row, column, placement)) {
        conflict.push('row');
      }
      if (!solver.checkColPlacement(puzzleString, row, column, placement)) {
        conflict.push('column');
      }
      if (!solver.checkRegionPlacement(puzzleString, row, column, placement)) {
        conflict.push('region');
      }

      if (conflict.length === 0) {
        res.json({
          valid: true
        });
      } else {
        res.json({
          valid: false,
          conflict
        });
      }
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
      
      // console.log(`req.body.puzzle`, req.body.puzzle); // DEBUG
      let solution;
      try {
        solution = solver.solve(req.body.puzzle);
      } catch (error) {
        if (error.name = 'UnsolvableError') {
          return res.json({ error: 'Puzzle cannot be solved' });
        }
      }
      
      res.json({
        solution
      });
    });
};
