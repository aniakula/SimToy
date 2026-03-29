import { Link } from 'react-router-dom';
import type { Simulation } from '../simulations/types';

interface SimulationCardProps {
  simulation: Simulation;
}

export default function SimulationCard({ simulation }: SimulationCardProps) {
  return (
    <Link
      to={`/simulation/${simulation.config.id}`}
      className="block bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-green-500 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 group"
    >
      <h2 className="text-xl font-semibold mb-3 text-white group-hover:text-green-400 transition-colors">
        {simulation.config.name}
      </h2>
      <p className="text-gray-400 text-sm mb-4 leading-relaxed">
        {simulation.config.description}
      </p>
      {simulation.config.category && simulation.config.category.length > 0 && (
  <div className="flex flex-wrap gap-2">
    {simulation.config.category.map((cat) => (
      <span
        key={cat}
        className="inline-block bg-green-500/20 text-green-400 text-xs font-medium px-3 py-1.5 rounded-md border border-green-500/30"
        >
          {cat}
        </span>
      ))}
    </div>
  )}
    </Link>
  );
}