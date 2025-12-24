import Link from "next/link";

const experiments = [
  {
    id: "noise",
    title: "Perlin Noise",
    description: "Generate organic terrain and textures using gradient noise",
    status: "coming soon",
  },
  {
    id: "cellular",
    title: "Cellular Automata",
    description: "Cave systems and organic patterns through simple rules",
    status: "coming soon",
  },
  {
    id: "lsystems",
    title: "L-Systems",
    description: "Procedural plants and fractals using string rewriting",
    status: "coming soon",
  },
  {
    id: "marching",
    title: "Marching Squares",
    description: "Contour extraction and smooth terrain boundaries",
    status: "coming soon",
  },
  {
    id: "wfc",
    title: "Wave Function Collapse",
    description: "Constraint-based tile generation and pattern synthesis",
    status: "coming soon",
  },
  {
    id: "voronoi",
    title: "Voronoi Diagrams",
    description: "Spatial partitioning for maps, crystals, and territories",
    status: "coming soon",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Subtle grid background */}
      <div
        className="fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #fff 1px, transparent 1px),
            linear-gradient(to bottom, #fff 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      <main className="relative max-w-6xl mx-auto px-6 py-20">
        {/* Header */}
        <header className="mb-20">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-500">
              Procedural Generation
            </span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 to-zinc-400">
              Experiments
            </span>
          </h1>
          <p className="text-lg text-zinc-500 max-w-xl leading-relaxed">
            A playground for exploring procedural generation algorithms. Click
            on an experiment to dive in.
          </p>
        </header>

        {/* Experiment Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {experiments.map((experiment, index) => (
            <Link
              key={experiment.id}
              href={`/experiments/${experiment.id}`}
              className="group relative overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-900/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900/80 hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-500/5"
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              {/* Card content */}
              <div className="relative">
                {/* Status badge */}
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-zinc-800/50 px-3 py-1 text-xs font-medium text-zinc-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  {experiment.status}
                </div>

                {/* Title */}
                <h2 className="mb-2 text-xl font-semibold text-zinc-100 transition-colors group-hover:text-emerald-300">
                  {experiment.title}
                </h2>

                {/* Description */}
                <p className="text-sm leading-relaxed text-zinc-500 group-hover:text-zinc-400 transition-colors">
                  {experiment.description}
                </p>

                {/* Arrow indicator */}
                <div className="mt-4 flex items-center gap-2 text-sm font-medium text-zinc-600 transition-all group-hover:text-emerald-400 group-hover:gap-3">
                  <span>Explore</span>
                  <svg
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer hint */}
        <footer className="mt-20 text-center">
          <p className="text-sm text-zinc-600">
            More experiments coming soon. Built with{" "}
            <span className="text-zinc-500">Next.js</span> +{" "}
            <span className="text-zinc-500">Canvas</span>
          </p>
        </footer>
      </main>
    </div>
  );
}
