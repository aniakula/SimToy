import { useParams, Link } from 'react-router-dom';
import { getSimulationById } from '../simulations';
import ParticleBackground from '../components/ParticleBackground';
import SimulationInfoBar from '../components/SimulationInfoBar';

export default function SimulationPage() {
  const { id } = useParams<{ id: string }>();
  const simulation = id ? getSimulationById(id) : null;

  if (!simulation) {
    return (
      <div className="min-h-screen relative text-white overflow-hidden bg-black">
        {/* Gradient Background */}
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-cyan-900/40 to-teal-900/50" style={{ zIndex: 0 }} />
        
        {/* Particle Background */}
        <ParticleBackground />
        
        {/* Content — above particle canvas (z-[1]) */}
        <div className="relative z-20">
          <div className="max-w-6xl mx-auto px-6 py-12">
            <h1 className="text-2xl mb-4 text-gray-300">Simulation not found</h1>
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors"
            >
              <span>←</span> Back to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const SimulationComponent = simulation.component;

  return (
    <div className="min-h-screen relative text-white overflow-hidden bg-black">
      {/* Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-cyan-900/40 to-teal-900/50" style={{ zIndex: 0 }} />
      
      {/* Particle Background */}
      <ParticleBackground />
      
      {/* Content*/}
      <div className="relative z-20">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 mb-6 text-green-400 hover:text-green-300 transition-colors"
          >
            <span>←</span> Back to simulations
          </Link>
          
          <div className="mb-6">
            <div className="mb-3 flex items-start gap-3">
              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById('simulation-info')
                    ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
                className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-green-500/45 bg-gray-900/95 text-green-400 shadow-lg backdrop-blur-sm transition-colors hover:border-green-400 hover:bg-gray-800 hover:text-green-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                aria-label="Scroll to help and controls"
              >
                <span className="font-serif text-lg font-bold italic leading-none" aria-hidden>
                  i
                </span>
              </button>
              <h1 className="min-w-0 flex-1 text-4xl font-bold text-green-400">
                {simulation.config.name}
              </h1>
            </div>
            <p className="text-gray-400 text-lg">{simulation.config.description}</p>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 shadow-2xl">
            <div className="flex justify-center items-center w-full">
              <SimulationComponent />
            </div>
          </div>

          <SimulationInfoBar
            blurb={simulation.config.infoBlurb}
            controls={simulation.config.controlsHelp}
          />
        </div>
      </div>
    </div>
  );
}