export const CellType = {
  Empty: 0,
  Full: 1,
} as const;

export type CellType = typeof CellType[keyof typeof CellType];

export interface Cell {
  type: CellType;
  color: string | null;
}

export type Grid = Cell[][];

export function createGrid(w: number, h: number): Grid {
  return Array.from({ length: h }, () =>
    Array.from({ length: w }, () => ({
      type: CellType.Empty,
      color: null
    }))
  );
}

// Count live neighbors
function countNeighbors(grid: Grid, x: number, y: number): number {
  let count = 0;
  const height = grid.length;
  const width = grid[0].length;

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue; 

      const nx = x + dx;
      const ny = y + dy;

      //grid wraps
      const wrappedX = (nx + width) % width;
      const wrappedY = (ny + height) % height;

      if (grid[wrappedY][wrappedX].type === CellType.Full) {
        count++;
      }
    }
  }

  return count;
}

export function step(grid: Grid): Grid {
  const newGrid = grid.map(row =>
    row.map(cell => ({ ...cell }))
  );

  const height = grid.length;
  const width = grid[0].length;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const neighbors = countNeighbors(grid, x, y);
      const currentCell = grid[y][x];

      if (currentCell.type === CellType.Full) {
        if (neighbors < 2 || neighbors > 3) {
          newGrid[y][x] = { type: CellType.Empty, color: null };
        } else {
          newGrid[y][x] = { ...currentCell };
        }
      } else {
        if (neighbors === 3) {
          newGrid[y][x] = { type: CellType.Full, color: null };
        } else {
          newGrid[y][x] = { type: CellType.Empty, color: null };
        }
      }
    }
  }

  return newGrid;
}

export function drawGrid(
  ctx: CanvasRenderingContext2D,
  grid: Grid,
  cellSize: number,
  showGridLines: boolean = true
) {
  const height = grid.length;
  const width = grid[0].length;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width * cellSize, height * cellSize);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const cell = grid[y][x];
      const pixelX = x * cellSize;
      const pixelY = y * cellSize;

      if (cell.type === CellType.Full) {
        ctx.fillStyle = "#000000";
        ctx.fillRect(pixelX, pixelY, cellSize, cellSize);
      }

     
      if (showGridLines) {
        ctx.strokeStyle = "#e5e7eb"; 
        ctx.lineWidth = 0.5;
        ctx.strokeRect(pixelX, pixelY, cellSize, cellSize);
      }
    }
  }
}

export function toggleCell(
  grid: Grid,
  x: number,
  y: number
): Grid {
  const newGrid = grid.map(row =>
    row.map(cell => ({ ...cell }))
  );

  if (y >= 0 && y < newGrid.length && x >= 0 && x < newGrid[0].length) {
    const cell = newGrid[y][x];
    newGrid[y][x] = {
      type: cell.type === CellType.Empty ? CellType.Full : CellType.Empty,
      color: null
    };
  }

  return newGrid;
}

export const PATTERNS: Record<string, number[][]> = {
  glider: [
    [0, 1, 0],
    [0, 0, 1],
    [1, 1, 1]
  ],
  blinker: [
    [1, 1, 1]
  ],
  toad: [
    [0, 1, 1, 1],
    [1, 1, 1, 0]
  ],
  beacon: [
    [1, 1, 0, 0],
    [1, 1, 0, 0],
    [0, 0, 1, 1],
    [0, 0, 1, 1]
  ],
  pulsar: [
    [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
    [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
    [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0]
  ],
  lwss: [ // light weight spaceship
    [0, 1, 0, 0, 1],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 0]
  ],
  block: [
    [1, 1],
    [1, 1]
  ],
  beehive: [
    [0, 1, 1, 0],
    [1, 0, 0, 1],
    [0, 1, 1, 0]
  ]
};

function clearGrid(grid: Grid): Grid {
  return Array.from({ length: grid.length }, () =>
    Array.from({ length: grid[0].length }, () => ({
      type: CellType.Empty,
      color: null
    }))
  );
}


export function placePattern(
  grid: Grid,
  pattern: number[][],
  centerX: number,
  centerY: number
): Grid {
  const newGrid = clearGrid(grid);

  const patternHeight = pattern.length;
  const patternWidth = pattern[0]?.length || 0;

  const startX = centerX - Math.floor(patternWidth / 2);
  const startY = centerY - Math.floor(patternHeight / 2);

  for (let py = 0; py < patternHeight; py++) {
    for (let px = 0; px < patternWidth; px++) {
      const gridX = startX + px;
      const gridY = startY + py;

      if (
        gridY >= 0 && gridY < newGrid.length &&
        gridX >= 0 && gridX < newGrid[0].length &&
        pattern[py][px] === 1
      ) {
        newGrid[gridY][gridX] = { type: CellType.Full, color: null };
      }
    }
  }

  return newGrid;
}
