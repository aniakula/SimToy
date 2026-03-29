import type { Simulation } from './types';
import SandSim from './sand/SandSim';
import GOLSim from './gol/GOLSim';
import WolframRuleSim from './wolfram-rule/WolframRuleSim';
import BoidsSim from './boids/BoidsSim';
import SchellingSim from './schelling/SchellingSim';

export const simulations: Simulation[] = [
  {
    config: {
      id: 'sand',
      name: 'Sand Simulation',
      description: 'Falling sand simulation',
      category: ['Cellular Automata'],
      infoBlurb:
        'Grains of sand fall and pile up using simple rules.',
      controlsHelp: [
        { label: 'Reset', description: 'Clears the grid to empty.' },
        { label: 'Color', description: 'Color of sand you paint onto the canvas.' },
        {
          label: 'Brush size',
          description: 'Radius of the brush when clicking or dragging.',
        },
        {
          label: 'Speed',
          description: 'How fast the sand updates (1 = slowest, 10 = fastest).',
        },
      ],
    },
    component: SandSim,
  },

  {
    config: {
      id: 'conway',
      name: "Conway's Game of Life",
      description: 'The classic cellular automaton',
      category: ['Cellular Automata'],
      infoBlurb:
        'Live cells survive or spawn from neighbor counts each generation. Pause, click to toggle cells or place a pattern, then start to evolve.',
      controlsHelp: [
        { label: 'Reset', description: 'Clears the entire grid.' },
        {
          label: 'Start / Stop',
          description: 'Runs or pauses time; you can only edit cells while stopped.',
        },
        {
          label: 'Speed',
          description: 'Delay between generations (1 = slowest, 10 = fastest).',
        },
        {
          label: 'Cell size',
          description: 'Pixel size per cell; changes grid dimensions and clears the board.',
        },
        {
          label: 'Add pattern',
          description: 'Places a named pattern at the center (stops the sim first).',
        },
      ],
    },
    component: GOLSim,
  },

  {
    config: {
      id: 'wolfram-rule',
      name: 'Wolfram Rules',
      description: '1D stacking cellular automaton',
      category: ['Cellular Automata', 'Social Simulation'],
      infoBlurb:
        'Each row follows an elementary rule (0–255) from the row above. A tiny seed grows into a history of stripes and chaos—try famous rules like 30.',
      controlsHelp: [
        {
          label: 'Reset',
          description: 'Restarts with one live cell in the middle of the top row.',
        },
        {
          label: 'Start / Stop',
          description: 'Adds new rows downward or pauses the growth.',
        },
        {
          label: 'Randomize seed',
          description: 'Fills the top row randomly and restarts from the top.',
        },
        {
          label: 'Rule',
          description: 'Wolfram rule number.',
        },
        {
          label: 'Speed',
          description: 'How quickly new rows appear (1 = slowest, 10 = fastest).',
        },
      ],
    },
    component: WolframRuleSim,
  },

  {
    config: {
      id: 'boids',
      name: 'Boids Mob Behavior',
      description: 'Simulation of flocking behavior',
      category: ['Social Simulation'],
      infoBlurb:
        'Boids steer using set parameters to align with neighbors, move toward the group, and avoid collisions. Together that produces flocking behavior.',
      controlsHelp: [
        { label: 'Reset', description: 'Respawns boids at random positions and velocities.' },
        {
          label: 'Speed',
          description: 'Simulation frame rate (1 = slowest, 10 = fastest).',
        },
        { label: 'Number of boids', description: 'How many boids are in the field.' },
        {
          label: 'Alignment',
          description: 'How strongly boids match the average direction of neighbors.',
        },
        {
          label: 'Cohesion',
          description: 'How strongly boids steer toward the center of neighbors.',
        },
        {
          label: 'Separation',
          description: 'How strongly boids avoid crowding when too close.',
        },
      ],
    },
    component: BoidsSim,
  },

  {
    config: {
      id: 'schelling',
      name: "Schelling's Segregation",
      description: 'Simulating segregation between two competing groups',
      category: ['Cellular Automata', 'Social Simulation'],
      infoBlurb:
        'Red and blue agents look for like-colored neighbors. Unhappy cells jump to empty spots.',
      controlsHelp: [
        {
          label: 'Reset',
          description: 'Randomly fills the grid using with current occupancy setting.',
        },
        { label: 'Start / Stop', description: 'Runs/pauses each round.' },
        {
          label: 'Unsatisfied count',
          description: 'count of cells that do not meet their similarity threshold.',
        },
        {
          label: 'Similarity',
          description: 'Minimum share of occupied neighbors that must match (25–75%).',
        },
        {
          label: 'Occupancy',
          description: 'Fraction of cells initially filled when you reset or change cell size.',
        },
        {
          label: 'Speed',
          description: 'Speed between rounds (1 = slowest, 10 = fastest).',
        },
        {
          label: 'Cell size',
          description: 'Pixel size per cell, resizes and refills the grid.',
        },
      ],
    },
    component: SchellingSim,
  },
];

export const getSimulationById = (id: string) => {
  return simulations.find(sim => sim.config.id === id);
};
