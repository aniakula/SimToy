export const CellType = {
    Empty: 0,
    Sand: 1,
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

  export function step(grid: Grid): Grid {
    const newGrid = grid.map(row => 
      row.map(cell => ({ ...cell }))
    );
    
    const width = grid[0].length;
    
    for (let y = grid.length - 2; y >= 0; y--) {
        for(let x = 0; x < grid[y].length; x++) {
            const cell = grid[y][x];
            if (cell.type === CellType.Sand) {
                // Fall straight down
                if (newGrid[y + 1][x].type === CellType.Empty) {
                    newGrid[y + 1][x] = { ...cell };
                    newGrid[y][x] = { type: CellType.Empty, color: null };
                } else if(newGrid[y + 1][x].type === CellType.Sand) {
                  // FIX: Check newGrid instead of grid for diagonals
                  const canGoRight = x + 1 < width && newGrid[y + 1][x + 1].type === CellType.Empty;
                  const canGoLeft = x - 1 >= 0 && newGrid[y + 1][x - 1].type === CellType.Empty;
                  
                  // Both diagonals are empty - pick randomly
                  if(canGoRight && canGoLeft) {
                      const newX = Math.random() < 0.5 ? x + 1 : x - 1;
                      newGrid[y + 1][newX] = { ...cell };
                      newGrid[y][x] = { type: CellType.Empty, color: null };
                  }
                  // Only right diagonal is empty
                  else if (canGoRight) {
                      newGrid[y + 1][x + 1] = { ...cell };
                      newGrid[y][x] = { type: CellType.Empty, color: null };
                  } 
                  // Only left diagonal is empty
                  else if(canGoLeft) {
                      newGrid[y + 1][x - 1] = { ...cell };
                      newGrid[y][x] = { type: CellType.Empty, color: null };
                  }
               }
            } 
        }
    }
    return newGrid;
  }

export function drawGrid(
    ctx: CanvasRenderingContext2D,
    grid: Grid,
    cellSize: number
  ) {
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[0].length; x++) {
        const cell = grid[y][x];
        if (cell.type === CellType.Sand) {
          ctx.fillStyle = cell.color || "gold";
          ctx.fillRect(
            x * cellSize,
            y * cellSize,
            cellSize,
            cellSize
          );
        }
      }
    }
  }

export function addSandAt(
  grid: Grid, 
  x: number, 
  y: number, 
  radius: number = 2,
  color: string = "gold"
): Grid {
  const newGrid = grid.map(row => 
    row.map(cell => ({ ...cell }))
  );
  
  // Add sand in a circular pattern around the point
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= radius) {
        const gridX = x + dx;
        const gridY = y + dy;
        if (
          gridX >= 0 && gridX < newGrid[0].length &&
          gridY >= 0 && gridY < newGrid.length && 
          grid[gridY][gridX].type === CellType.Empty
        ) {
          newGrid[gridY][gridX] = { 
            type: CellType.Sand, 
            color: color 
          };
        }
      }
    }
  }
  
  return newGrid;
}
  