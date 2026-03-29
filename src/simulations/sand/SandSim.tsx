import { useEffect, useRef, useState } from "react";
import { drawGrid, createGrid, step, addSandAt } from "./sandSimulation";

const WIDTH = 200;
const HEIGHT = 100;
const CELL_SIZE = 5;

export default function SandGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef(createGrid(WIDTH, HEIGHT));
  const isDrawingRef = useRef(false);
  const [radius, setRadius] = useState(3);
  const [color, setColor] = useState("#ffd700"); // Default gold color
  const [speed, setSpeed] = useState(5); // Speed from 1 (slowest) to 10 (fastest)

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
      if (currentTime - lastTime >= frameDelay) {
        // Fill background with black 
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        gridRef.current = step(gridRef.current);
        drawGrid(ctx, gridRef.current, CELL_SIZE);

        lastTime = currentTime;
      }

      animationFrameId = requestAnimationFrame(loop);
    }

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [speed]);

  // Mouse event handlers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getGridPosition = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      
      // Get the actual displayed size of the canvas
      // The canvas maintains aspect ratio, so calculate scale based on actual dimensions
      const scaleX = rect.width / canvas.width;
      const scaleY = rect.height / canvas.height;
      
      // Convert mouse position relative to the canvas element's bounding rect
      const relativeX = clientX - rect.left;
      const relativeY = clientY - rect.top;
      
      // Convert to canvas pixel coordinates accounting for scaling
      const canvasX = relativeX / scaleX;
      const canvasY = relativeY / scaleY;
      
      // Convert to grid coordinates
      const x = Math.floor(canvasX / CELL_SIZE);
      const y = Math.floor(canvasY / CELL_SIZE);
      
      return { x, y };
    };

    const handleMouseDown = (e: MouseEvent) => {
      isDrawingRef.current = true;
      const { x, y } = getGridPosition(e.clientX, e.clientY);
      // Clamp coordinates to valid range
      const clampedX = Math.max(0, Math.min(x, WIDTH - 1));
      const clampedY = Math.max(0, Math.min(y, HEIGHT - 1));
      // Only add sand if coordinates are within bounds
      if (clampedX >= 0 && clampedX < WIDTH && clampedY >= 0 && clampedY < HEIGHT) {
        gridRef.current = addSandAt(gridRef.current, clampedX, clampedY, radius, color);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isDrawingRef.current) {
        const { x, y } = getGridPosition(e.clientX, e.clientY);
        // Clamp coordinates to valid range
        const clampedX = Math.max(0, Math.min(x, WIDTH - 1));
        const clampedY = Math.max(0, Math.min(y, HEIGHT - 1));
        // Only add sand if coordinates are within bounds
        if (clampedX >= 0 && clampedX < WIDTH && clampedY >= 0 && clampedY < HEIGHT) {
          gridRef.current = addSandAt(gridRef.current, clampedX, clampedY, radius, color);
        }
      }
    };

    const handleMouseUp = () => {
      isDrawingRef.current = false;
    };

    const handleMouseLeave = () => {
      isDrawingRef.current = false;
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseleave", handleMouseLeave);

      return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [radius, color]);

  return (
    <div className="flex flex-col justify-center items-center w-full gap-4">
      {/* Control Panel */}
      <div className="w-full max-w-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4 shadow-lg">
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Reset Button */}
          <button 
            onClick={() => {
              gridRef.current = createGrid(WIDTH, HEIGHT);
            }}
            className="bg-green-500 hover:bg-green-600 text-black px-6 py-2 rounded font-medium transition-colors whitespace-nowrap"
          >
            Reset
          </button>
          
          {/* Color Picker */}
          <div className="flex flex-col gap-2 flex-1 w-full md:w-auto">
            <label htmlFor="color-picker" className="text-green-400 text-sm font-medium">
              Color
            </label>
            <div className="flex items-center gap-3">
              <input
                id="color-picker"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-20 cursor-pointer rounded border-2 border-gray-600 bg-gray-700"
              />
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="#ffd700"
              />
            </div>
          </div>
          
          {/* Brush Size Slider */}
          <div className="flex flex-col gap-2 flex-1 w-full md:w-auto">
            <label htmlFor="radius-slider" className="text-green-400 text-sm font-medium">
              Brush Size: {radius}
            </label>
            <input
              id="radius-slider"
              type="range"
              min="1"
              max="10"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #22c55e 0%, #22c55e ${((radius - 1) / 9) * 100}%, #1f2937 ${((radius - 1) / 9) * 100}%, #1f2937 100%)`
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
