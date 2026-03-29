export interface Boid {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface BoidsConfig {
  width: number;
  height: number;
  numBoids: number;
  alignmentWeight: number;
  cohesionWeight: number;
  separationWeight: number;
  maxSpeed: number;
  perceptionRadius: number;
  separationRadius: number;
}

const DEFAULT_CONFIG: Omit<BoidsConfig, 'width' | 'height'> = {
  numBoids: 50,
  alignmentWeight: 1.0,
  cohesionWeight: 1.0,
  separationWeight: 1.5,
  maxSpeed: 4,
  perceptionRadius: 50,
  separationRadius: 25,
};

export function createBoids(width: number, height: number, numBoids: number): Boid[] {
  return Array.from({ length: numBoids }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2,
  }));
}

function distance(boid1: Boid, boid2: Boid): number {
  const dx = boid1.x - boid2.x;
  const dy = boid1.y - boid2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function limit(vector: { x: number; y: number }, max: number): { x: number; y: number } {
  const mag = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
  if (mag > max) {
    return {
      x: (vector.x / mag) * max,
      y: (vector.y / mag) * max,
    };
  }
  return vector;
}

function wrapAround(boid: Boid, width: number, height: number): void {
  if (boid.x < 0) boid.x = width;
  if (boid.x > width) boid.x = 0;
  if (boid.y < 0) boid.y = height;
  if (boid.y > height) boid.y = 0;
}

export function stepBoids(
  boids: Boid[],
  config: BoidsConfig
): Boid[] {
  const { width, height, alignmentWeight, cohesionWeight, separationWeight, maxSpeed, perceptionRadius, separationRadius } = config;

  return boids.map((boid, i) => {
    // Find neighbors within perception radius
    const neighbors: Boid[] = [];
    for (let j = 0; j < boids.length; j++) {
      if (i !== j) {
        const dist = distance(boid, boids[j]);
        if (dist < perceptionRadius) {
          neighbors.push(boids[j]);
        }
      }
    }

    // Calculate alignment (steer towards average heading of neighbors)
    let alignmentX = 0;
    let alignmentY = 0;
    if (neighbors.length > 0) {
      for (const neighbor of neighbors) {
        alignmentX += neighbor.vx;
        alignmentY += neighbor.vy;
      }
      alignmentX /= neighbors.length;
      alignmentY /= neighbors.length;
      const alignment = limit({ x: alignmentX, y: alignmentY }, maxSpeed);
      alignmentX = alignment.x;
      alignmentY = alignment.y;
    }

    // Calculate cohesion (steer towards average position of neighbors)
    let cohesionX = 0;
    let cohesionY = 0;
    if (neighbors.length > 0) {
      for (const neighbor of neighbors) {
        cohesionX += neighbor.x;
        cohesionY += neighbor.y;
      }
      cohesionX /= neighbors.length;
      cohesionY /= neighbors.length;
      cohesionX -= boid.x;
      cohesionY -= boid.y;
      const cohesion = limit({ x: cohesionX, y: cohesionY }, maxSpeed);
      cohesionX = cohesion.x;
      cohesionY = cohesion.y;
    }

    // Calculate separation (steer away from neighbors that are too close)
    let separationX = 0;
    let separationY = 0;
    const closeNeighbors = neighbors.filter(n => distance(boid, n) < separationRadius);
    if (closeNeighbors.length > 0) {
      for (const neighbor of closeNeighbors) {
        const diffX = boid.x - neighbor.x;
        const diffY = boid.y - neighbor.y;
        const dist = distance(boid, neighbor);
        if (dist > 0) {
          separationX += diffX / dist;
          separationY += diffY / dist;
        }
      }
      separationX /= closeNeighbors.length;
      separationY /= closeNeighbors.length;
      const separation = limit({ x: separationX, y: separationY }, maxSpeed);
      separationX = separation.x;
      separationY = separation.y;
    }

    // Apply weights and update velocity
    let newVx = boid.vx + 
      alignmentX * alignmentWeight + 
      cohesionX * cohesionWeight + 
      separationX * separationWeight;
    
    let newVy = boid.vy + 
      alignmentY * alignmentWeight + 
      cohesionY * cohesionWeight + 
      separationY * separationWeight;

    // Limit speed
    const velocity = limit({ x: newVx, y: newVy }, maxSpeed);
    newVx = velocity.x;
    newVy = velocity.y;

    // Update position
    const newBoid: Boid = {
      x: boid.x + newVx,
      y: boid.y + newVy,
      vx: newVx,
      vy: newVy,
    };

    // Wrap around edges
    wrapAround(newBoid, width, height);

    return newBoid;
  });
}

export function drawBoids(
  ctx: CanvasRenderingContext2D,
  boids: Boid[]
): void {
  ctx.fillStyle = "#22c55e"; // Green color
  for (const boid of boids) {
    // Draw boid as a triangle pointing in direction of movement
    ctx.save();
    ctx.translate(boid.x, boid.y);
    const angle = Math.atan2(boid.vy, boid.vx);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(5, 0); // Point forward
    ctx.lineTo(-3, -3); // Back left
    ctx.lineTo(-3, 3); // Back right
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

export function getDefaultConfig(width: number, height: number): BoidsConfig {
  return {
    ...DEFAULT_CONFIG,
    width,
    height,
  };
}
