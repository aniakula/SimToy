import { useEffect, useRef, useState } from "react";
import {
  createGrid,
  drawGrid,
  randomFill,
  step,
  countUnsatisfied,
  type SchellingGrid,
} from "./schellingSimulation";

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 800;
const DEFAULT_CELL_SIZE = 12;
const DEFAULT_DENSITY = 0.9;

function makeFilledGrid(cellSize: number, d: number): SchellingGrid {
  const w = Math.floor(CANVAS_WIDTH / cellSize);
  const h = Math.floor(CANVAS_HEIGHT / cellSize);
  const g = createGrid(w, h);
  randomFill(g, d);
  return g;
}

export default function SchellingSim() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [speed, setSpeed] = useState(5);
  const simRef = useRef(false);
  const [sim, setSim] = useState(false);
  const [cellSize, setCellSize] = useState(DEFAULT_CELL_SIZE);
  const lastCellSizeRef = useRef(cellSize);

  const [thresholdPct, setThresholdPct] = useState(50);
  const threshold = thresholdPct / 100;

  const [densityPct, setDensityPct] = useState(90);
  const density = densityPct / 100;

  const width = Math.floor(CANVAS_WIDTH / cellSize);
  const height = Math.floor(CANVAS_HEIGHT / cellSize);

  const gridRef = useRef<SchellingGrid>(
    makeFilledGrid(DEFAULT_CELL_SIZE, DEFAULT_DENSITY)
  );

  const [unhappyCount, setUnhappyCount] = useState(0);

  useEffect(() => {
    const sizeChanged = lastCellSizeRef.current !== cellSize;
    if (sizeChanged) {
      lastCellSizeRef.current = cellSize;
      simRef.current = false;
      setSim(false);
      gridRef.current = makeFilledGrid(cellSize, density);
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawGrid(ctx, gridRef.current, cellSize);
    setUnhappyCount(countUnsatisfied(gridRef.current, threshold));
    // density only used when cell size changes (new random fill)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cellSize]);

  useEffect(() => {
    setUnhappyCount(countUnsatisfied(gridRef.current, thresholdPct / 100));
  }, [thresholdPct]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    const getFrameDelay = (s: number) => {
      const minDelay = 16;
      const maxDelay = 200;
      return maxDelay - ((s - 1) / 9) * (maxDelay - minDelay);
    };

    let lastTime = 0;
    const frameDelay = getFrameDelay(speed);
    let animationFrameId: number;

    function loop(currentTime: number) {
      if (simRef.current) {
        if (currentTime - lastTime >= frameDelay) {
          step(gridRef.current, threshold);
          drawGrid(ctx, gridRef.current, cellSize);
          setUnhappyCount(countUnsatisfied(gridRef.current, threshold));
          lastTime = currentTime;
        }
      }
      animationFrameId = requestAnimationFrame(loop);
    }
    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [speed, cellSize, threshold]);

  const handleReset = () => {
    simRef.current = false;
    setSim(false);
    gridRef.current = makeFilledGrid(cellSize, density);
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    drawGrid(ctx, gridRef.current, cellSize);
    setUnhappyCount(countUnsatisfied(gridRef.current, threshold));
  };

  return (
    <div className="flex flex-col justify-center items-center w-full gap-4">
      <div className="w-full max-w-4xl bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4 shadow-lg">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={handleReset}
              className="bg-green-500 hover:bg-green-600 text-black px-6 py-2 rounded font-medium transition-colors whitespace-nowrap"
            >
              Reset
            </button>

            <button
              type="button"
              onClick={() => {
                simRef.current = !simRef.current;
                setSim(simRef.current);
              }}
              className="bg-green-500 hover:bg-green-600 text-black px-6 py-2 rounded font-medium transition-colors whitespace-nowrap"
            >
              {sim ? "Stop" : "Start"}
            </button>

            <div className="text-gray-300 text-sm">
              Unsatisfied agents:{" "}
              <span className="text-green-400 font-medium">{unhappyCount}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="threshold-slider"
                className="text-green-400 text-sm font-medium"
              >
                Similarity: {thresholdPct}%
              </label>
              <input
                id="threshold-slider"
                type="range"
                min="25"
                max="75"
                step="1"
                value={thresholdPct}
                onChange={(e) => setThresholdPct(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #22c55e 0%, #22c55e ${((thresholdPct - 25) / 50) * 100}%, #1f2937 ${((thresholdPct - 25) / 50) * 100}%, #1f2937 100%)`,
                }}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="density-slider"
                className="text-green-400 text-sm font-medium"
              >
                Occupancy: {densityPct}%
              </label>
              <input
                id="density-slider"
                type="range"
                min="50"
                max="98"
                step="1"
                value={densityPct}
                onChange={(e) => setDensityPct(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #22c55e 0%, #22c55e ${((densityPct - 50) / 48) * 100}%, #1f2937 ${((densityPct - 50) / 48) * 100}%, #1f2937 100%)`,
                }}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="speed-slider"
                className="text-green-400 text-sm font-medium"
              >
                Speed: {speed}/10
              </label>
              <input
                id="speed-slider"
                type="range"
                min="1"
                max="10"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #22c55e 0%, #22c55e ${((speed - 1) / 9) * 100}%, #1f2937 ${((speed - 1) / 9) * 100}%, #1f2937 100%)`,
                }}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="cell-size-slider"
                className="text-green-400 text-sm font-medium"
              >
                Cell size: {cellSize}px ({width}×{height})
              </label>
              <input
                id="cell-size-slider"
                type="range"
                min="8"
                max="24"
                value={cellSize}
                onChange={(e) => setCellSize(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #22c55e 0%, #22c55e ${((cellSize - 8) / 16) * 100}%, #1f2937 ${((cellSize - 8) / 16) * 100}%, #1f2937 100%)`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full flex justify-center">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="rounded shadow-lg"
          style={{
            cursor: "default",
            display: "block",
            maxWidth: "100%",
            height: "auto",
          }}
        />
      </div>
    </div>
  );
}
