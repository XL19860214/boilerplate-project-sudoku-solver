const EventTarget = require('./event-target.js');

class SudokuSolver {

  validate(puzzleString) {
    return /^[1-9\.]{81}$/.test(puzzleString);
  }

  //
  validateRowColumn(row, column) {
    if (row < 0 || row > 8) {
      return false;
    }
    if (column < 0 || column > 8) {
      return false;
    }
    return true;
  }

  //
  validateValue(value) {
    return '123456789'.indexOf(value) !== -1;
  }

  //
  rowNumber(row) {
    const rowString = 'ABCDEFGHI';
    return rowString.indexOf(row);
  }

  //
  columnNumber(column) {
    return column - 1;
  }

  // Region start number
  regionStartNumber(rowOrColumnNumber) {
    if (rowOrColumnNumber >= 0 && rowOrColumnNumber < 3) {
      return 0;
    } else if (rowOrColumnNumber >= 3 && rowOrColumnNumber < 6) {
      return 3;
    }
    return 6;
  }

  // indexToRowNumber
  indexToRowNumber(index) {
    return Math.floor(index / 9);
  }

  // indexToColumnNumber
  indexToColumnNumber(index) {
    return index % 9;
  }

  //
  withoutDuplicate(partString, index, value) {
    const firstIndex = partString.indexOf(value);
    if (firstIndex === -1) {
      return true;
    } else if (firstIndex === index && firstIndex === partString.lastIndexOf(value)) {
      return true;
    }
    return false;
  }

  checkRowPlacement(puzzleString, row, column, value) {
    if (!this.validate(puzzleString)) throw new Error('Invalid puzzle string.');

    if (!this.validateRowColumn(row, column)) throw new Error('Invalid row or column.');

    if (!this.validateValue(value)) throw new Error('Invalid value.');

    const indexStart = row * 9;
    const rowString = puzzleString.substring(indexStart, indexStart + 9);
    // console.log(puzzleString, `row ${row}`, `column ${column}`, `value ${value}`, `rowString ${rowString}`); // DEBUG

    return this.withoutDuplicate(rowString, column, value);
  }

  checkColPlacement(puzzleString, row, column, value) {
    if (!this.validate(puzzleString)) throw new Error('Invalid puzzle string.');

    if (!this.validateRowColumn(row, column)) throw new Error('Invalid row or column.');

    if (!this.validateValue(value)) throw new Error('Invalid value.');

    let columnString = puzzleString[column];
    let i = 1;
    while (columnString.length < 9) {
      columnString = columnString.concat(puzzleString[column + (i * 9)]);
      i++;
    }

    return this.withoutDuplicate(columnString, row, value);
  }

  checkRegionPlacement(puzzleString, row, column, value) {
    if (!this.validate(puzzleString)) throw new Error('Invalid puzzle string.');

    if (!this.validateRowColumn(row, column)) throw new Error('Invalid row or column.');

    if (!this.validateValue(value)) throw new Error('Invalid value.');
    
    const rowStart = this.regionStartNumber(row);
    const columnStart = this.regionStartNumber(column);
    let regionString = '';
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const index = (rowStart + i) * 9 + (columnStart + j);
        regionString = regionString.concat(puzzleString[index]);
      }
    }

    return this.withoutDuplicate(regionString, (row - rowStart) * 3 + column - columnStart, value);
  }

  solve(puzzleString) {
    if (!this.validate(puzzleString)) throw new Error('Invalid puzzle string.');

    const valid = puzzleString.split('').every((placeholder, index) => {
      const row = Math.floor(index / 9);
      const column = index % 9;

      if (placeholder === '.') return true;

      return this.checkRowPlacement(puzzleString, row, column, placeholder) && this.checkColPlacement(puzzleString, row, column, placeholder) && this.checkRegionPlacement(puzzleString, row, column, placeholder);

    });

    if (!valid) throw new Error('Invalid puzzle string.');

    // 1. Compute possible placements for each cell at initial state.
    // 2. Complete unique solution for collection or inked collections.
    //      - Collection indiates row, column, region.
    // 3. Start resolve minimum variant solution collections.
    // 4. Finish and output single resolution or multiple solutions.

    const cells = new Map();
    puzzleString.split('').forEach((placeholder, index) => {
      const cellRow = this.indexToRowNumber(index);
      const cellColumn = this.indexToColumnNumber(index);
      // 0 1 2
      // 3 4 5
      // 6 7 8
      const regionOrder = Math.floor(cellRow / 3) * 3 + Math.floor(cellColumn / 3) * 3;
      const regionX = cellColumn - this.regionStartNumber(cellColumn);
      const regionY = cellRow - this.regionStartNumber(cellRow);
      let placement = null;
      if (placeholder === '.') {
        const placementInitialOptions = '123456789'.split('').filter(placement => {
          return this.checkRowPlacement(puzzleString, cellRow, cellColumn, placement)
                   && this.checkColPlacement(puzzleString, cellRow, cellColumn, placement)
                   && this.checkRegionPlacement(puzzleString, cellRow, cellColumn, placement)
        });
        placement = {
          options: {
            initial: new Set(placementInitialOptions),
            current: new Set(placementInitialOptions),
            value: null
          }
        }
      }
      // Cell
      const cell = Object.assign(new EventTarget(), {
        index, // Index in puzzleString
        placeholder, // Initial placeholder
        row: cellRow,
        column: cellColumn,
        region: {
          order: regionOrder,
          x: regionX, // Internal x
          y: regionY, // internal y
        },
        placement
      });
      cell.addEventListener('updatePlacementValue', updatedCell => {
        
      });
      //
      cells.set(index, cell);
    });

    console.log(`cells`, cells); // DEBUG

    return [];
  }
}

module.exports = SudokuSolver;

