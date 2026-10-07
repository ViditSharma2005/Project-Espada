// src/components/shell/generator/PromptChips.tsx — predefined quick starts.
// They float above the prompt box; clicking one starts generation immediately
// (GeneratorView handles that — the chip just hands its prompt up).

"use client";

import type { ComponentType } from "react";
import { motion } from "motion/react";
import {
  Flame,
  GraduationCap,
  HeartHandshake,
  Rocket,
} from "lucide-react";

export type QuickStart = {
  icon: ComponentType<{ className?: string }>;
  label: string;
  prompt: string;
};

export const QUICK_STARTS: QuickStart[] = [
  {
    icon: Rocket,
    label: "Stop procrastinating",
    prompt: "A reel on how to stop procrastinating and finally start",
  },
  {
    icon: Flame,
    label: "Beating fear and doubt",
    prompt: "A message for students dealing with fear and self-doubt",
  },
  {
    icon: HeartHandshake,
    label: "A life of service",
    prompt: "Why a life of service to others matters",
  },
  {
    icon: GraduationCap,
    label: "What education builds",
    prompt: "What a real education builds in a student",
  },
];

export function PromptChips({
  disabled,
  onPick,
}: {
  disabled: boolean;
  onPick: (prompt: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {QUICK_STARTS.map((chip, index) => (
        <motion.div
          key={chip.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.07 * index,
            duration: 0.45,
            ease: "easeOut",
          }}
        >
          <motion.button
            type="button"
            disabled={disabled}
            onClick={() => onPick(chip.prompt)}
            animate={{ y: [0, -3, 0] }}
            transition={{
              duration: 3.4 + index * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs text-white/70 transition-colors hover:border-white/25 hover:bg-white/[0.07] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40"
          >
            <chip.icon className="size-3.5" aria-hidden="true" />
            {chip.label}
          </motion.button>
        </motion.div>
      ))}
    </div>
  );
}
