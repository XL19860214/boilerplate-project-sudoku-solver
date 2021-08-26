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

  startNumber(rowOrColumnNumber) {
    if (rowOrColumnNumber >= 0 && rowOrColumnNumber < 3) {
      return 0;
    } else if (rowOrColumnNumber >= 3 && rowOrColumnNumber < 6) {
      return 3;
    }
    return 6;
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
    
    const rowStart = this.startNumber(row);
    const columnStart = this.startNumber(column);
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
    
  }
}

module.exports = SudokuSolver;

