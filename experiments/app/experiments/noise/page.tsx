"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";

// Perlin noise implementation
class PerlinNoise {
  private permutation: number[];

  constructor(seed: number = Math.random() * 10000) {
    this.permutation = this.generatePermutation(seed);
  }

  private generatePermutation(seed: number): number[] {
    const perm = Array.from({ length: 256 }, (_, i) => i);
    // Simple seeded shuffle
    let s = seed;
    for (let i = perm.length - 1; i > 0; i--) {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      const j = s % (i + 1);
      [perm[i], perm[j]] = [perm[j], perm[i]];
    }
    return [...perm, ...perm];
  }

  private fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  private lerp(a: number, b: number, t: number): number {
    return a + t * (b - a);
  }

  private grad(hash: number, x: number, y: number): number {
    const h = hash & 3;
    const u = h < 2 ? x : y;
    const v = h < 2 ? y : x;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  noise2D(x: number, y: number): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;

    x -= Math.floor(x);
    y -= Math.floor(y);

    const u = this.fade(x);
    const v = this.fade(y);

    const A = this.permutation[X] + Y;
    const B = this.permutation[X + 1] + Y;

    return this.lerp(
      this.lerp(
        this.grad(this.permutation[A], x, y),
        this.grad(this.permutation[B], x - 1, y),
        u
      ),
      this.lerp(
        this.grad(this.permutation[A + 1], x, y - 1),
        this.grad(this.permutation[B + 1], x - 1, y - 1),
        u
      ),
      v
    );
  }

  // Fractal Brownian Motion for more natural-looking noise
  fbm(x: number, y: number, octaves: number, persistence: number): number {
    let total = 0;
    let frequency = 1;
    let amplitude = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      total += this.noise2D(x * frequency, y * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= 2;
    }

    return total / maxValue;
  }
}

type ColorMode = "grayscale" | "terrain" | "heat" | "neon" | "clouds";

export default function PerlinNoisePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState(80);
  const [octaves, setOctaves] = useState(6);
  const [persistence, setPersistence] = useState(0.55);
  const [seed, setSeed] = useState(42);
  const [colorMode, setColorMode] = useState<ColorMode>("clouds");
  const [animating, setAnimating] = useState(false);
  const [zOffset, setZOffset] = useState(0);
  const animationRef = useRef<number>();

  const getColor = useCallback(
    (value: number): [number, number, number] => {
      // Normalize from [-1, 1] to [0, 1]
      const normalized = (value + 1) / 2;

      switch (colorMode) {
        case "grayscale":
          const gray = Math.floor(normalized * 255);
          return [gray, gray, gray];

        case "terrain":
          if (normalized < 0.35) {
            // Deep water to shallow water
            const t = normalized / 0.35;
            return [
              Math.floor(20 + t * 40),
              Math.floor(60 + t * 80),
              Math.floor(120 + t * 80),
            ];
          } else if (normalized < 0.45) {
            // Beach/sand
            const t = (normalized - 0.35) / 0.1;
            return [
              Math.floor(194 + t * 20),
              Math.floor(178 + t * 10),
              Math.floor(128 - t * 20),
            ];
          } else if (normalized < 0.65) {
            // Grass/forest
            const t = (normalized - 0.45) / 0.2;
            return [
              Math.floor(34 + t * 20),
              Math.floor(139 - t * 40),
              Math.floor(34 + t * 10),
            ];
          } else if (normalized < 0.8) {
            // Mountains/rock
            const t = (normalized - 0.65) / 0.15;
            return [
              Math.floor(90 + t * 40),
              Math.floor(80 + t * 40),
              Math.floor(70 + t * 40),
            ];
          } else {
            // Snow caps
            const t = (normalized - 0.8) / 0.2;
            return [
              Math.floor(200 + t * 55),
              Math.floor(200 + t * 55),
              Math.floor(210 + t * 45),
            ];
          }

        case "heat":
          if (normalized < 0.25) {
            const t = normalized / 0.25;
            return [0, 0, Math.floor(t * 255)];
          } else if (normalized < 0.5) {
            const t = (normalized - 0.25) / 0.25;
            return [0, Math.floor(t * 255), Math.floor(255 - t * 128)];
          } else if (normalized < 0.75) {
            const t = (normalized - 0.5) / 0.25;
            return [Math.floor(t * 255), 255, Math.floor(127 - t * 127)];
          } else {
            const t = (normalized - 0.75) / 0.25;
            return [255, Math.floor(255 - t * 255), 0];
          }

        case "neon":
          const hue = normalized * 360;
          const s = 1;
          const l = 0.5 + normalized * 0.2;
          const c = (1 - Math.abs(2 * l - 1)) * s;
          const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
          const m = l - c / 2;
          let r = 0,
            g = 0,
            b = 0;
          if (hue < 60) [r, g, b] = [c, x, 0];
          else if (hue < 120) [r, g, b] = [x, c, 0];
          else if (hue < 180) [r, g, b] = [0, c, x];
          else if (hue < 240) [r, g, b] = [0, x, c];
          else if (hue < 300) [r, g, b] = [x, 0, c];
          else [r, g, b] = [c, 0, x];
          return [
            Math.floor((r + m) * 255),
            Math.floor((g + m) * 255),
            Math.floor((b + m) * 255),
          ];

        case "clouds":
          // Sunset clouds: deep purple/blue -> warm orange -> pink -> cream
          // Using smooth interpolation through color stops
          const stops = [
            { pos: 0.0, color: [25, 20, 60] },     // Deep purple-black
            { pos: 0.15, color: [50, 30, 90] },    // Dark purple
            { pos: 0.3, color: [100, 50, 140] },   // Purple
            { pos: 0.4, color: [180, 80, 120] },   // Magenta-pink
            { pos: 0.5, color: [255, 120, 80] },   // Warm orange
            { pos: 0.6, color: [255, 160, 100] },  // Light orange
            { pos: 0.7, color: [240, 170, 150] },  // Peachy pink
            { pos: 0.8, color: [220, 180, 180] },  // Dusty rose
            { pos: 0.9, color: [210, 190, 200] },  // Soft lavender-cream
            { pos: 1.0, color: [230, 210, 220] },  // Warm cream
          ];

          // Find the two stops we're between
          let lowerIdx = 0;
          for (let i = 0; i < stops.length - 1; i++) {
            if (normalized >= stops[i].pos && normalized <= stops[i + 1].pos) {
              lowerIdx = i;
              break;
            }
          }

          const lower = stops[lowerIdx];
          const upper = stops[Math.min(lowerIdx + 1, stops.length - 1)];
          const range = upper.pos - lower.pos;
          const t2 = range > 0 ? (normalized - lower.pos) / range : 0;
          
          // Smooth interpolation
          const smoothT = t2 * t2 * (3 - 2 * t2);
          
          return [
            Math.floor(lower.color[0] + (upper.color[0] - lower.color[0]) * smoothT),
            Math.floor(lower.color[1] + (upper.color[1] - lower.color[1]) * smoothT),
            Math.floor(lower.color[2] + (upper.color[2] - lower.color[2]) * smoothT),
          ];

        default:
          return [128, 128, 128];
      }
    },
    [colorMode]
  );

  const renderNoise = useCallback(
    (zOff: number = 0) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      const imageData = ctx.createImageData(width, height);
      const perlin = new PerlinNoise(seed);

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const nx = (x / scale) + zOff;
          const ny = (y / scale) + zOff * 0.5;
          const value = perlin.fbm(nx, ny, octaves, persistence);
          const [r, g, b] = getColor(value);

          const i = (y * width + x) * 4;
          imageData.data[i] = r;
          imageData.data[i + 1] = g;
          imageData.data[i + 2] = b;
          imageData.data[i + 3] = 255;
        }
      }

      ctx.putImageData(imageData, 0, 0);
    },
    [scale, octaves, persistence, seed, getColor]
  );

  useEffect(() => {
    renderNoise(zOffset);
  }, [renderNoise, zOffset]);

  useEffect(() => {
    if (animating) {
      let z = zOffset;
      const animate = () => {
        z += 0.02;
        setZOffset(z);
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animating]);

  const randomizeSeed = () => {
    setSeed(Math.floor(Math.random() * 100000));
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Header */}
      <header className="border-b border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span className="text-sm font-medium">Back</span>
            </Link>
            <div className="h-4 w-px bg-zinc-700" />
            <h1 className="text-lg font-semibold">Perlin Noise</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono text-zinc-500">LIVE</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-[1fr_320px] gap-8">
          {/* Canvas Area */}
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900">
              <canvas
                ref={canvasRef}
                width={640}
                height={480}
                className="w-full h-auto"
              />
            </div>
            <p className="text-sm text-zinc-500">
              Perlin noise creates smooth, natural-looking gradients perfect for
              terrain generation, clouds, and organic textures.
            </p>
          </div>

          {/* Controls Panel */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
                Parameters
              </h2>

              {/* Scale */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <label className="text-zinc-300">Scale</label>
                  <span className="font-mono text-zinc-500">{scale}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="200"
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              {/* Octaves */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <label className="text-zinc-300">Octaves</label>
                  <span className="font-mono text-zinc-500">{octaves}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={octaves}
                  onChange={(e) => setOctaves(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              {/* Persistence */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <label className="text-zinc-300">Persistence</label>
                  <span className="font-mono text-zinc-500">
                    {persistence.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={persistence * 100}
                  onChange={(e) => setPersistence(Number(e.target.value) / 100)}
                  className="w-full accent-emerald-500"
                />
              </div>

              {/* Seed */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <label className="text-zinc-300">Seed</label>
                  <span className="font-mono text-zinc-500">{seed}</span>
                </div>
                <button
                  onClick={randomizeSeed}
                  className="w-full py-2 px-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors"
                >
                  🎲 Randomize Seed
                </button>
              </div>

              {/* Color Mode */}
              <div className="space-y-2">
                <label className="text-sm text-zinc-300">Color Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    ["clouds", "terrain", "heat", "neon", "grayscale"] as ColorMode[]
                  ).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setColorMode(mode)}
                      className={`py-2 px-3 rounded-lg text-xs font-medium capitalize transition-all ${
                        colorMode === mode
                          ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/50"
                          : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Animation Toggle */}
              <button
                onClick={() => setAnimating(!animating)}
                className={`w-full py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                  animating
                    ? "bg-rose-500/20 text-rose-400 ring-1 ring-rose-500/50"
                    : "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/50"
                }`}
              >
                {animating ? "⏹ Stop Animation" : "▶ Animate"}
              </button>
            </div>

            {/* Info Box */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
                How It Works
              </h3>
              <ul className="space-y-2 text-sm text-zinc-500">
                <li className="flex gap-2">
                  <span className="text-emerald-400">•</span>
                  <span>
                    <strong className="text-zinc-300">Scale</strong> controls
                    the zoom level of the noise pattern
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-400">•</span>
                  <span>
                    <strong className="text-zinc-300">Octaves</strong> layer
                    multiple noise frequencies for detail
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-400">•</span>
                  <span>
                    <strong className="text-zinc-300">Persistence</strong>{" "}
                    controls how much each octave contributes
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

