import { useEffect, useRef, useState } from "react";
import { 
  createBoids, 
  stepBoids, 
  drawBoids, 
  getDefaultConfig,
  type Boid,
  type BoidsConfig 
} from "./boidsSimulation";

const WIDTH = 800;
const HEIGHT = 600;

export default function BoidsSim() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [numBoids, setNumBoids] = useState(50);
  const [speed, setSpeed] = useState(5); // Speed from 1 (slowest) to 10 (fastest)
  const [alignmentWeight, setAlignmentWeight] = useState(1.0);
  const [cohesionWeight, setCohesionWeight] = useState(1.0);
  const [separationWeight, setSeparationWeight] = useState(1.5);
  
  const boidsRef = useRef<Boid[]>(createBoids(WIDTH, HEIGHT, numBoids));
  const configRef = useRef<BoidsConfig>(getDefaultConfig(WIDTH, HEIGHT));

  // Update boids array when numBoids changes
  useEffect(() => {
    const currentCount = boidsRef.current.length;
    if (numBoids > currentCount) {
      // Add new boids
      const newBoids = createBoids(WIDTH, HEIGHT, numBoids - currentCount);
      boidsRef.current = [...boidsRef.current, ...newBoids];
    } else if (numBoids < currentCount) {
      // Remove boids
      boidsRef.current = boidsRef.current.slice(0, numBoids);
    }
  }, [numBoids]);

  // Update config when parameters change
  useEffect(() => {
    configRef.current = {
      ...configRef.current,
      numBoids,
      alignmentWeight,
      cohesionWeight,
      separationWeight,
    };
  }, [numBoids, alignmentWeight, cohesionWeight, separationWeight]);

  // Reset function
  const reset = () => {
    boidsRef.current = createBoids(WIDTH, HEIGHT, numBoids);
  };

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

        // Update boids
        boidsRef.current = stepBoids(boidsRef.current, configRef.current);
        
        // Draw boids
        drawBoids(ctx, boidsRef.current);

        lastTime = currentTime;
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
      <div className="w-full max-w-4xl bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4 shadow-lg">
        <div className="flex flex-col gap-4">
          {/* First Row: Reset and Speed */}
          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* Reset Button */}
            <button 
              onClick={reset}
              className="bg-green-500 hover:bg-green-600 text-black px-6 py-2 rounded font-medium transition-colors whitespace-nowrap"
            >
              Reset
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

            {/* Number of Boids Slider */}
            <div className="flex flex-col gap-2 flex-1 w-full md:w-auto">
              <label htmlFor="num-boids-slider" className="text-green-400 text-sm font-medium">
                Number of Boids: {numBoids}
              </label>
              <input
                id="num-boids-slider"
                type="range"
                min="10"
                max="200"
                value={numBoids}
                onChange={(e) => setNumBoids(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #22c55e 0%, #22c55e ${((numBoids - 10) / 190) * 100}%, #1f2937 ${((numBoids - 10) / 190) * 100}%, #1f2937 100%)`
                }}
              />
            </div>
          </div>

          {/* Second Row: Three Parameters */}
          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* Alignment Weight Slider */}
            <div className="flex flex-col gap-2 flex-1 w-full md:w-auto">
              <label htmlFor="alignment-slider" className="text-green-400 text-sm font-medium">
                Alignment: {alignmentWeight.toFixed(2)}
              </label>
              <input
                id="alignment-slider"
                type="range"
                min="0"
                max="3"
                step="0.1"
                value={alignmentWeight}
                onChange={(e) => setAlignmentWeight(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #22c55e 0%, #22c55e ${(alignmentWeight / 3) * 100}%, #1f2937 ${(alignmentWeight / 3) * 100}%, #1f2937 100%)`
                }}
              />
            </div>

            {/* Cohesion Weight Slider */}
            <div className="flex flex-col gap-2 flex-1 w-full md:w-auto">
              <label htmlFor="cohesion-slider" className="text-green-400 text-sm font-medium">
                Cohesion: {cohesionWeight.toFixed(2)}
              </label>
              <input
                id="cohesion-slider"
                type="range"
                min="0"
                max="3"
                step="0.1"
                value={cohesionWeight}
                onChange={(e) => setCohesionWeight(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #22c55e 0%, #22c55e ${(cohesionWeight / 3) * 100}%, #1f2937 ${(cohesionWeight / 3) * 100}%, #1f2937 100%)`
                }}
              />
            </div>

            {/* Separation Weight Slider */}
            <div className="flex flex-col gap-2 flex-1 w-full md:w-auto">
              <label htmlFor="separation-slider" className="text-green-400 text-sm font-medium">
                Separation: {separationWeight.toFixed(2)}
              </label>
              <input
                id="separation-slider"
                type="range"
                min="0"
                max="3"
                step="0.1"
                value={separationWeight}
                onChange={(e) => setSeparationWeight(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #22c55e 0%, #22c55e ${(separationWeight / 3) * 100}%, #1f2937 ${(separationWeight / 3) * 100}%, #1f2937 100%)`
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="w-full flex justify-center">
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          className="rounded shadow-lg border border-gray-700"
          style={{ 
            display: "block",
            maxWidth: "100%",
            height: "auto"
          }}
        />
      </div>
    </div>
  );
}
