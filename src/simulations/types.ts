import React from 'react';

export interface SimulationControlHelp {
  label: string;
  description: string;
}

export interface SimulationConfig {
    id: string;
    name: string;
    description: string;
    category: string[];
    /** Short overview (~2 lines) for the sim info bar. */
    infoBlurb: string;
    /** What each control does; shown in the info bar below the sim. */
    controlsHelp: SimulationControlHelp[];
    thumbnail?: string;
  }
  
  export interface Simulation {
    config: SimulationConfig;
    component: React.ComponentType;
  }
