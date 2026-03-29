import { useEffect, useRef, useState } from "react";
import { drawGrid, createGrid, step, toggleCell, placePattern, PATTERNS } from "./golSimulation";

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 800;


const DEFAULT_CELL_SIZE = 20;

export default function GOLSim() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [speed, setSpeed] = useState(5); 
  const simRef = useRef(false);
  const [sim, setSim] = useState(false);
  const [cellSize, setCellSize] = useState(DEFAULT_CELL_SIZE);
  const [selectedPattern, setSelectedPattern] = useState<string>("");
  
  const WIDTH = Math.floor(CANVAS_WIDTH / cellSize);
  const HEIGHT = Math.floor(CANVAS_HEIGHT / cellSize);
  
  const initialWidth = Math.floor(CANVAS_WIDTH / DEFAULT_CELL_SIZE);
  const initialHeight = Math.floor(CANVAS_HEIGHT / DEFAULT_CELL_SIZE);
  const gridRef = useRef(createGrid(initialWidth, initialHeight));
  
  // when cell size changes
  useEffect(() => {
    simRef.current = false;
    setSim(false);
    
    const newWidth = Math.floor(CANVAS_WIDTH / cellSize);
    const newHeight = Math.floor(CANVAS_HEIGHT / cellSize);
    gridRef.current = createGrid(newWidth, newHeight);
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    drawGrid(ctx, gridRef.current, cellSize, true);
  }, [cellSize]);
  
  //Initial draw
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    drawGrid(ctx, gridRef.current, cellSize, true);
  }, []);

  // simulation loop
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    const getFrameDelay = (speed: number) => {
      const minDelay = 16; 
      const maxDelay = 200; 
      return maxDelay - ((speed - 1) / 9) * (maxDelay - minDelay);
    };

    let lastTime = 0;
    const frameDelay = getFrameDelay(speed);
    let animationFrameId: number;

    function loop(currentTime: number) {
      if (simRef.current) {
        if (currentTime - lastTime >= frameDelay) {
          gridRef.current = step(gridRef.current);
          drawGrid(ctx, gridRef.current, cellSize, true);
          lastTime = currentTime;
        }
      }
      animationFrameId = requestAnimationFrame(loop);
    }
    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [speed, cellSize]);

  // mouse event handlers 
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getGridPosition = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();

      const scaleX = rect.width / canvas.width;
      const scaleY = rect.height / canvas.height;
      
      // mouse position within canvas
      const relativeX = clientX - rect.left;
      const relativeY = clientY - rect.top;
      
      // accounting for scaling
      const canvasX = relativeX / scaleX;
      const canvasY = relativeY / scaleY;
    
      const x = Math.floor(canvasX / cellSize);
      const y = Math.floor(canvasY / cellSize);
      
      return { x, y };
    };

    const handleClick = (e: MouseEvent) => {
      if (!simRef.current) {
        const { x, y } = getGridPosition(e.clientX, e.clientY);
        const currentWidth = Math.floor(CANVAS_WIDTH / cellSize);
        const currentHeight = Math.floor(CANVAS_HEIGHT / cellSize);
        const clampedX = Math.max(0, Math.min(x, currentWidth - 1));
        const clampedY = Math.max(0, Math.min(y, currentHeight - 1));

        if (clampedX >= 0 && clampedX < currentWidth && clampedY >= 0 && clampedY < currentHeight) {
          gridRef.current = toggleCell(gridRef.current, clampedX, clampedY);
          const ctx = canvas.getContext("2d")!;
          drawGrid(ctx, gridRef.current, cellSize, true);
        }
      }
    };

    canvas.addEventListener("click", handleClick);

    return () => {
      canvas.removeEventListener("click", handleClick);
    };
  }, [cellSize]);

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
              const currentWidth = Math.floor(CANVAS_WIDTH / cellSize);
              const currentHeight = Math.floor(CANVAS_HEIGHT / cellSize);
              gridRef.current = createGrid(currentWidth, currentHeight);
              const canvas = canvasRef.current!;
              const ctx = canvas.getContext("2d")!;
              drawGrid(ctx, gridRef.current, cellSize, true);
            }}
            className="bg-green-500 hover:bg-green-600 text-black px-6 py-2 rounded font-medium transition-colors whitespace-nowrap"
          >
            Reset
          </button>

          {/* Start/Stop Button */}
          <button 
            onClick={() => {
              simRef.current = !simRef.current;
              setSim(simRef.current);
            }}
            className="bg-green-500 hover:bg-green-600 text-black px-6 py-2 rounded font-medium transition-colors whitespace-nowrap"
          >
            {sim ? "Stop" : "Start"}
          </button>

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
          {/* Grid Size Slider*/}
          <div className="flex flex-col gap-2 flex-1 w-full md:w-auto">
            <label htmlFor="cell-size-slider" className="text-green-400 text-sm font-medium">
              Cell Size: {cellSize}px ({WIDTH}×{HEIGHT})
            </label>
            <input
              id="cell-size-slider"
              type="range"
              min="10"
              max="25"
              value={cellSize}
              onChange={(e) => setCellSize(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #22c55e 0%, #22c55e ${((cellSize - 10) / 15) * 100}%, #1f2937 ${((cellSize - 10) / 15) * 100}%, #1f2937 100%)`
              }}
            />
          </div>
          
          {/* Pattern Dropdown */}
          <div className="flex flex-col gap-2 flex-1 w-full md:w-auto">
            <label htmlFor="pattern-select" className="text-green-400 text-sm font-medium">
              Add Pattern
            </label>
            <select
              id="pattern-select"
              value={selectedPattern}
              onChange={(e) => {
                const patternName = e.target.value;
                setSelectedPattern(patternName);
                
                if (patternName && PATTERNS[patternName]) {
                  simRef.current = false;
                  setSim(false);
                  
                  const centerX = Math.floor(WIDTH / 2);
                  const centerY = Math.floor(HEIGHT / 2);
                  gridRef.current = placePattern(gridRef.current, PATTERNS[patternName], centerX, centerY);
                  
                  const canvas = canvasRef.current!;
                  const ctx = canvas.getContext("2d")!;
                  drawGrid(ctx, gridRef.current, cellSize, true);
                  
                  setSelectedPattern("");
                }
              }}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select a pattern...</option>
              {Object.keys(PATTERNS).map((patternName) => (
                <option key={patternName} value={patternName}>
                  {patternName.charAt(0).toUpperCase() + patternName.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="w-full flex justify-center">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="rounded shadow-lg"
          style={{ 
            cursor: sim ? "default" : "pointer",
            display: "block",
            maxWidth: "100%",
            height: "auto"
          }}
        />
      </div>
    </div>
  );
}
