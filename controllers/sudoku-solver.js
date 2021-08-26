class SudokuSolver {

  validate(puzzleString) {
    return /^[1-9\.]{81}$/.test(puzzleString);
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
    if (!this.valid(puzzleString)) throw new Error('Invalid puzzle string.');

    const rowNumber = this.rowNumber(row);
    const rowStart = rowNumber * 9;
    const rowString = puzzleString.substring(rowStart, 9);

    return this.withoutDuplicate(rowString, value);
  }

  checkColPlacement(puzzleString, row, column, value) {
    if (!this.valid(puzzleString)) throw new Error('Invalid puzzle string.');

    const columnNumber = this.columnNumber(column);
    let columnString = puzzleString[columnNumber];
    let i = 1;
    while (columnString.length < 9) {
      columnString.concat(puzzleString[columnNumber * i]);
      i++;
    }

    return this.withoutDuplicate(columnString, value);
  }

  checkRegionPlacement(puzzleString, row, column, value) {
    if (!this.valid(puzzleString)) throw new Error('Invalid puzzle string.');
    
    const rowNumber = this.rowNumber(row);
    const rowStart = this.startNumber(rowNumber);
    const columnNumber = this.columnNumber(column);
    const columnStart = this.startNumber(columnNumber);
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

