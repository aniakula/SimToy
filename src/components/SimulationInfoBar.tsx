import type { SimulationControlHelp } from '../simulations/types';

interface SimulationInfoBarProps {
  blurb: string;
  controls: SimulationControlHelp[];
}

export default function SimulationInfoBar({ blurb, controls }: SimulationInfoBarProps) {
  return (
    <section
      id="simulation-info"
      className="mt-4 w-full scroll-mt-24 rounded-lg border border-gray-700/80 bg-gray-900/60 p-4 text-sm shadow-inner"
      aria-label="Simulation help"
    >
      <p className="mb-4 max-w-4xl text-gray-400 leading-relaxed">{blurb}</p>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-green-500/90">
        Controls
      </h3>
      <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {controls.map((item) => (
          <div key={item.label} className="border-l-2 border-green-500/25 pl-3">
            <dt className="font-medium text-green-400/95">{item.label}</dt>
            <dd className="mt-0.5 text-gray-500 leading-snug">{item.description}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
