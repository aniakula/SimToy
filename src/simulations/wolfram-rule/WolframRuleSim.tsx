import { useEffect, useRef, useState } from "react";
import { drawRow, createGrid, step, CellType} from "./wolframRuleSimulation";

const WIDTH = 200;
const HEIGHT = 100;
const CELL_SIZE = 5;
const DEFAULT_RULE = 30;
export default function WolframRuleGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rule, setRule] = useState(DEFAULT_RULE);
  const gridRef = useRef(createGrid(WIDTH, HEIGHT, DEFAULT_RULE));
  const [speed, setSpeed] = useState(5); // Speed from 1 (slowest) to 10 (fastest)
  const rowRef = useRef(0);
  const simRef = useRef(false);
  const [sim, setSim] = useState(false);

  // Reset grid when rule changes
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const newGrid = createGrid(WIDTH, HEIGHT, rule);
    const middleX = Math.floor(WIDTH / 2);
    newGrid.cells[0][middleX] = { type: CellType.Full, color: null };
    gridRef.current = newGrid;
    rowRef.current = 0;
    simRef.current = false;
    setSim(false);
    // Fill background with white 
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawRow(ctx, gridRef.current, CELL_SIZE, 0);
  }, [rule]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    // Convert speed (1-10) to frame delay in milliseconds
    // Speed 10 = 16ms (~60 FPS), Speed 1 = 200ms (~5 FPS)
    const getFrameDelay = (speed: number) => {
      const minDelay = 16; // ~60 FPS
      const maxDelay = 200; // ~5 FPS
      // Invert so higher speed = lower delay
      return maxDelay - ((speed - 1) / 9) * (maxDelay - minDelay);
    };

    let lastTime = 0;
    const frameDelay = getFrameDelay(speed);
    let animationFrameId: number;

    function loop(currentTime: number) {
      if (simRef.current && rowRef.current < HEIGHT - 1) {
        if (currentTime - lastTime >= frameDelay) {
            gridRef.current = step(gridRef.current, rowRef.current);
            drawRow(ctx, gridRef.current, CELL_SIZE, rowRef.current + 1);
            rowRef.current += 1;
            lastTime = currentTime;
        }
      }
      animationFrameId = requestAnimationFrame(loop);
    }
    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [speed]);

  return (
    <div className="flex flex-col justify-center items-center w-full gap-4">
      {/* Control Panel */}
      <div className="w-full max-w-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4 shadow-lg">
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Reset Button */}
          <button 
            onClick={() => {
                simRef.current = false;
                setSim(false);
                const newGrid = createGrid(WIDTH, HEIGHT, rule);
                // Initialize first row with a single cell in the middle
                const middleX = Math.floor(WIDTH / 2);
                newGrid.cells[0][middleX] = { type: CellType.Full, color: null };
                gridRef.current = newGrid;
                rowRef.current = 0;
                // Redraw canvas
                const canvas = canvasRef.current!;
                const ctx = canvas.getContext("2d")!;
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                drawRow(ctx, gridRef.current, CELL_SIZE, 0);
            }}
            className="bg-green-500 hover:bg-green-600 text-black px-6 py-2 rounded font-medium transition-colors whitespace-nowrap"
          >
            Reset
          </button>

          <button 
            onClick={() => {
              simRef.current = !simRef.current;
              setSim(simRef.current);
            }}
            className="bg-green-500 hover:bg-green-600 text-black px-6 py-2 rounded font-medium transition-colors whitespace-nowrap"
          >
            {sim ? "Stop" : "Start"}
          </button>

          <button 
            onClick={() => {
                simRef.current = false;
                setSim(false);
                const newGrid = createGrid(WIDTH, HEIGHT, rule);
                // Initialize first row with a single cell in the middle
                for (let i = 0; i < WIDTH; i++) {
                    newGrid.cells[0][i] = { type: Math.random() < 0.5 ? CellType.Full : CellType.Empty, color: null };
                }
                gridRef.current = newGrid;
                rowRef.current = 0;
                // Redraw canvas
                const canvas = canvasRef.current!;
                const ctx = canvas.getContext("2d")!;
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                drawRow(ctx, gridRef.current, CELL_SIZE, 0);
            }}
            className="bg-green-500 hover:bg-green-600 text-black px-6 py-2 rounded font-medium transition-colors whitespace-nowrap"
          >
            Randomize Seed
          </button>
      

          {/* Rule Slider */}
          <div className="flex flex-col gap-2 flex-1 w-full md:w-auto">
            <label htmlFor="rule-slider" className="text-green-400 text-sm font-medium">
              Rule: {rule}
            </label>
            <input
              id="rule-slider"
              type="range"
              min="0"
              max="255"
              value={rule}
              onChange={(e) => setRule(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #22c55e 0%, #22c55e ${(rule / 255) * 100}%, #1f2937 ${(rule / 255) * 100}%, #1f2937 100%)`
              }}
            />
          </div>

          {/* Speed Slider */}
          <div className="flex flex-col gap-2 flex-1 w-full md:w-auto">
            <label htmlFor="speed-slider" className="text-green-400 text-sm font-medium">
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
                background: `linear-gradient(to right, #22c55e 0%, #22c55e ${((speed - 1) / 9) * 100}%, #1f2937 ${((speed - 1) / 9) * 100}%, #1f2937 100%)`
              }}
            />
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="w-full flex justify-center">
        <canvas
          ref={canvasRef}
          width={WIDTH * CELL_SIZE}
          height={HEIGHT * CELL_SIZE}
          className="rounded shadow-lg"
          style={{ 
            cursor: "crosshair",
            display: "block",
            maxWidth: "100%",
            height: "auto"
          }}
        />
      </div>
    </div>
  );
}
