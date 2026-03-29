export const CellType = {
    Empty: 0,
    Full: 1,
  } as const;
  
  export type CellType = typeof CellType[keyof typeof CellType];

  export interface Cell {
    type: CellType;
    color: string | null;
  }
  
  export interface Grid{
    cells: Cell[][];
    rule: number;
    //rule is a binary number where:
    //the leftmost bit to the rightmost bit are the outpput for the following inputs:
    //000, 001, 010, 011, 100, 101, 110, 111
  }

  export function createGrid(w: number, h: number, rule: number): Grid {
    return {
        cells: Array.from({ length: h }, () =>
        Array.from({ length: w }, () => ({ 
            type: CellType.Empty, 
            color: null 
        }))),
        rule: rule
    }
  }

  function getOutput(rule: number, input: number): CellType {
    const binaryRule = rule.toString(2).padStart(8, '0');
    return (parseInt(binaryRule[7 - input], 2) as CellType);
  }

  export function step(grid: Grid, row: number): Grid {
    const newGrid = grid.cells.map(row => 
      row.map(cell => ({ ...cell }))
    );
    const currGrid = grid.cells;
    const rule = grid.rule;
    const currentRow = currGrid[row];
    const width = currGrid[0].length;
    const nextRow = newGrid[row + 1];
    for(let x = 0; x < width; x++) {
        const input = [
            x - 1 < 0 ? currentRow[width - 1].type : currentRow[x - 1].type,
            x < 0 ? 0 : currentRow[x].type,
            x + 1 < width ? currentRow[x + 1].type : 0
        ];
        const output = getOutput(rule, input[0] * 4 + input[1] * 2 + input[2]);
        nextRow[x] = { type: output, color: null };
    }

    return { cells: newGrid, rule: rule };
  }

export function drawRow(
    ctx: CanvasRenderingContext2D,
    grid: Grid,
    cellSize: number,
    row: number
  ) {
      for (let x = 0; x < grid.cells[0].length; x++) {
        const cell = grid.cells[row][x];
        if (cell.type === CellType.Empty) {
          ctx.fillStyle = "white";
          ctx.fillRect(
            x * cellSize,
            row * cellSize,
            cellSize,
            cellSize
          );
        }
        else {
          ctx.fillStyle = "black";
          ctx.fillRect(
            x * cellSize,
            row * cellSize,
            cellSize,
            cellSize
          );
        }
    }
}