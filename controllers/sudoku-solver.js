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
  rowNumber(row) {
    const rowString = 'ABCDEFGHI';
    return rowString.indexOf(row);
  }

  //
  columnNumber(column) {
    return column - 1;
  }

  startNumber(rowOrColumnNumber) {
    if (rowOrColumnNumber >= 0 && rowOrColumnNumber < 3) {
      return 0;
    } else if (rowOrColumnNumber >= 3 && rowOrColumnNumber < 6) {
      return 3;
    }
    return 6;
  }

  //
  withoutDuplicate(partString, value) {
    const firstIndex = partString.indexOf(value);
    if (firstIndex === -1) {
      return true;
    } else if (firstIndex === partString.lastIndexOf(value)) {
      return true;
    }
    return false;
  }

  checkRowPlacement(puzzleString, row, column, value) {
    if (!this.validate(puzzleString)) throw new Error('Invalid puzzle string.');

    if (!this.validateRowColumn(row, column)) throw new Error('Invalid row or column.');

    const indexStart = row * 9;
    const rowString = puzzleString.substring(indexStart, indexStart + 9);
    // console.log(`rowString`, rowString); // DEBUG
    // console.log(puzzleString, `row ${row}`, `column ${column}`, `value ${value}`, `rowString ${rowString}`); // DEBUG

    return this.withoutDuplicate(rowString, value);
  }

  checkColPlacement(puzzleString, row, column, value) {
    if (!this.validate(puzzleString)) throw new Error('Invalid puzzle string.');

    if (!this.validateRowColumn(row, column)) throw new Error('Invalid row or column.');

    let columnString = puzzleString[column];
    let i = 1;
    while (columnString.length < 9) {
      columnString.concat(puzzleString[column * i]);
      i++;
    }

    return this.withoutDuplicate(columnString, value);
  }

  checkRegionPlacement(puzzleString, row, column, value) {
    if (!this.validate(puzzleString)) throw new Error('Invalid puzzle string.');

    if (!this.validateRowColumn(row, column)) throw new Error('Invalid row or column.');
    
    const rowStart = this.startNumber(row);
    const columnStart = this.startNumber(column);
    let regionString = '';
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const index = (rowStart + i) * 9 + (columnStart + j);
        regionString.concat(puzzleString[index]);
      }
    }

    return this.withoutDuplicate(regionString, value);
  }

  solve(puzzleString) {
    
  }
}

module.exports = SudokuSolver;

