"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

export function FloatingPathsBackground({
  position,
  children,
  className,
  showControls = false,
}: {
  position: number;
  className?: string;
  children: ReactNode;
  showControls?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const [motionOverride, setMotionOverride] = useState<boolean | null>(null);
  const animatePaths = motionOverride ?? !reduceMotion;
  const paths = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        id: i,
        d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
          380 - i * 5 * position
        } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
          152 - i * 5 * position
        } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
          684 - i * 5 * position
        } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
        width: 0.5 + i * 0.03,
        trailOpacity: 0.08 + i * 0.002,
        flowOpacity: 0.28 + i * 0.003,
        phase: (i % 12) / 24,
        // Stable timing prevents parent re-renders from restarting the animation.
        duration: 10 + ((i * 7) % 5) * 0.8,
      })),
    [position],
  );

  return (
    <div className={cn("relative isolate w-full", className)}>
      <div
        className="floating-paths-art pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <svg
          className="h-full w-full text-slate-950 dark:text-white"
          viewBox="0 0 696 316"
          preserveAspectRatio="none"
          fill="none"
          focusable="false"
        >
          <g transform="translate(180 0) scale(0.8 0.4)">
            <g className="floating-paths-trails">
              {paths.map((path) => (
                <path
                  key={path.id}
                  d={path.d}
                  stroke="currentColor"
                  strokeWidth={path.width}
                  strokeOpacity={path.trailOpacity}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </g>
            {animatePaths && (
              <g className="floating-paths-flow">
                {paths.map((path) => (
                  <motion.path
                    key={path.id}
                    d={path.d}
                    stroke="currentColor"
                    strokeWidth={path.width}
                    strokeOpacity={path.flowOpacity}
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                    initial={{
                      pathLength: 0.12,
                      pathSpacing: 0.38,
                      pathOffset: path.phase,
                    }}
                    animate={{
                      pathOffset: [path.phase, path.phase + 0.5],
                    }}
                    transition={{
                      duration: path.duration,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                  />
                ))}
              </g>
            )}
          </g>
        </svg>
      </div>
      <div className="relative z-10">{children}</div>
      {showControls && (
        <button
          type="button"
          className="floating-paths-toggle"
          aria-label={
            animatePaths
              ? "Pause background animation"
              : "Play background animation"
          }
          onClick={() => setMotionOverride(!animatePaths)}
        >
          {animatePaths ? <Pause size={12} /> : <Play size={12} />}
          {animatePaths ? "Pause flow" : "Play flow"}
        </button>
      )}
    </div>
  );
}
