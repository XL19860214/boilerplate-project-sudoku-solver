

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

    // ======================================================================================
    // Brute-force

    // Log placeholder positions
    let placeholders = [];
    puzzleString.split('').forEach((placeholder, index) => {
      if (placeholder === '.') {
        placeholders.push(index);
      }
    });
    const placeholdersAmount = placeholders.length;

    // console.log(`placeholders`, placeholders.length, placeholders); // DEBUG

    let solution = puzzleString;

    const fillOptions = start => {
      let options = '';
      let i = start;
      while (i < 10) {
        options = options.concat(i);
        i++;
      }

      return options;
    };

    const stepSolve = step => {
      let updated = false;
      const index = placeholders[step];
      const row = this.indexToRowNumber(index);
      const column = this.indexToColumnNumber(index);
      let options;
      const placeholder = solution.split('')[index];
      if (placeholder === '.') {
        options = fillOptions(1);
      } else { // Try next
        options = fillOptions(parseInt(placeholder) + 1);
      }

      options.split('').forEach(option => {
        if (updated) {
          return;
        }
        if (this.checkRowPlacement(solution, row, column, option) && this.checkColPlacement(solution, row, column, option) && this.checkRegionPlacement(solution, row, column, option)) {
          solution = solution.substring(0, index) + option + solution.substring(index + 1);
          updated = true;
        }
      });

      // Revert
      if (!updated && placeholder !== '.') {
        solution = solution.substring(0, index) + '.' + solution.substring(index + 1);
      }

      // console.log(`step`, step, `index`, index, `placeholder`, placeholder, `options`, options, `solution`, solution); // DEBUG

      return updated;
    };

    let currentStep = 0;
    while (currentStep >= 0 && (solution.includes('.') || currentStep < placeholdersAmount - 1)) {
      if (stepSolve(currentStep)) {
        currentStep++;
      } else {
        currentStep--;
      }
    }

    if (currentStep < 0) {
      throw new Error('Puzzle cannot be solved');
    }

    // console.log(`solution`, solution); // DEBUG

    return solution;
  }
}

module.exports = SudokuSolver;

