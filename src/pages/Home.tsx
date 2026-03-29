import { simulations } from '../simulations';
import SimulationCard from '../components/SimulationCard';
import ParticleBackground from '../components/ParticleBackground';

export default function HomePage() {
  return (
    <div className="min-h-screen relative text-white overflow-hidden bg-black">
      {/* Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-cyan-900/30 to-teal-700/50" style={{ zIndex: 0 }} />
      
      {/* Particle Background */}
      <ParticleBackground />
      
      {/* Content — above particle canvas (z-[1]) */}
      <div className="relative z-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="mb-12">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
              Sim Toy
            </h1>
            <p className="text-gray-400 text-lg">
              Select a simulation to explore
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {simulations.map((sim) => (
              <SimulationCard key={sim.config.id} simulation={sim} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}