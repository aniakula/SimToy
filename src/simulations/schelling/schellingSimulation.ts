/** 0 = empty, 1 = type A, 2 = type B */
export type Cell = 0 | 1 | 2;

export interface SchellingGrid {
  cells: Cell[][];
  width: number;
  height: number;
}

function shuffleInPlace<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

export function createGrid(width: number, height: number): SchellingGrid {
  const cells: Cell[][] = [];
  for (let y = 0; y < height; y++) {
    cells[y] = [];
    for (let x = 0; x < width; x++) {
      cells[y][x] = 0;
    }
  }
  return { cells, width, height };
}

/** Fraction of same-type among occupied neighbors (Moore); empty neighbors ignored. */
export function neighborSameFraction(
  grid: SchellingGrid,
  x: number,
  y: number
): { same: number; occupied: number } {
  const self = grid.cells[y][x];
  if (self === 0) return { same: 0, occupied: 0 };

  let same = 0;
  let occupied = 0;

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || nx >= grid.width || ny < 0 || ny >= grid.height) continue;
      const n = grid.cells[ny][nx];
      if (n === 0) continue;
      occupied++;
      if (n === self) same++;
    }
  }

  return { same, occupied };
}

export function isSatisfied(
  grid: SchellingGrid,
  x: number,
  y: number,
  threshold: number
): boolean {
  const self = grid.cells[y][x];
  if (self === 0) return true;

  const { same, occupied } = neighborSameFraction(grid, x, y);
  if (occupied === 0) return true;

  return same / occupied >= threshold;
}

/** Random fill: `density` fraction of cells occupied, split evenly between types (remainder random). */
export function randomFill(
  grid: SchellingGrid,
  density: number
): void {
  const { width, height, cells } = grid;
  const total = width * height;
  const nAgents = Math.floor(total * density);
  const nA = Math.floor(nAgents / 2);
  const nB = nAgents - nA;

  const positions: { x: number; y: number }[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      positions.push({ x, y });
      cells[y][x] = 0;
    }
  }
  shuffleInPlace(positions);

  let i = 0;
  for (; i < nA; i++) {
    const { x, y } = positions[i];
    cells[y][x] = 1;
  }
  for (; i < nA + nB; i++) {
    const { x, y } = positions[i];
    cells[y][x] = 2;
  }
}

function wouldBeSatisfiedAt(
  grid: SchellingGrid,
  x: number,
  y: number,
  agentType: 1 | 2,
  threshold: number
): boolean {
  let same = 0;
  let occupied = 0;

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || nx >= grid.width || ny < 0 || ny >= grid.height) continue;
      const n = grid.cells[ny][nx];
      if (n === 0) continue;
      occupied++;
      if (n === agentType) same++;
    }
  }

  if (occupied === 0) return true;
  return same / occupied >= threshold;
}

export function countUnsatisfied(grid: SchellingGrid, threshold: number): number {
  let count = 0;
  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      if (grid.cells[y][x] !== 0 && !isSatisfied(grid, x, y, threshold)) {
        count++;
      }
    }
  }
  return count;
}

/**
 * One round: each unsatisfied agent (random order) tries to move to a random empty cell
 * where they would be satisfied; otherwise stays.
 */
export function step(grid: SchellingGrid, threshold: number): void {
  const unsatisfied: { x: number; y: number }[] = [];
  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      if (grid.cells[y][x] !== 0 && !isSatisfied(grid, x, y, threshold)) {
        unsatisfied.push({ x, y });
      }
    }
  }
  shuffleInPlace(unsatisfied);

  for (const { x, y } of unsatisfied) {
    const agent = grid.cells[y][x];
    if (agent === 0) continue;
    if (isSatisfied(grid, x, y, threshold)) continue;

    const agentType = agent as 1 | 2;
    grid.cells[y][x] = 0;

    const candidates: { x: number; y: number }[] = [];
    for (let ey = 0; ey < grid.height; ey++) {
      for (let ex = 0; ex < grid.width; ex++) {
        if (grid.cells[ey][ex] !== 0) continue;
        if (wouldBeSatisfiedAt(grid, ex, ey, agentType, threshold)) {
          candidates.push({ x: ex, y: ey });
        }
      }
    }

    if (candidates.length > 0) {
      const pick = candidates[Math.floor(Math.random() * candidates.length)];
      grid.cells[pick.y][pick.x] = agentType;
    } else {
      grid.cells[y][x] = agentType;
    }
  }
}

const COLOR_EMPTY = "#1f2937";
const COLOR_A = "#ef4444";
const COLOR_B = "#3b82f6";

export function drawGrid(
  ctx: CanvasRenderingContext2D,
  grid: SchellingGrid,
  cellSize: number
): void {
  const { width, height, cells } = grid;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const c = cells[y][x];
      ctx.fillStyle =
        c === 0 ? COLOR_EMPTY : c === 1 ? COLOR_A : COLOR_B;
      ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
    }
  }
}
