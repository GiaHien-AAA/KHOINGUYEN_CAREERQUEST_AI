import { motion } from 'motion/react';

import type { RoleplayActor } from '../game/roleplayScenarioData';

interface PixelDialogBoxProps {
  actor: RoleplayActor;
  eyebrow?: string;
  title?: string;
  text: string;
  isLoading?: boolean;
  compact?: boolean;
}

export function PixelDialogBox({
  actor,
  eyebrow = 'ĐANG NÓI',
  title,
  text,
  isLoading = false,
  compact = false,
}: PixelDialogBoxProps) {
  return (
    <div className="relative">
      <div
        className="absolute -left-2 top-8 z-0 hidden h-7 w-7 rotate-45 border-b-4 border-l-4 bg-[#fff8f0] md:block"
        style={{ borderColor: '#111827' }}
      />

      <div
        className="relative z-10 rounded-[18px] border-4 border-[#111827] bg-[#fff8f0] p-4 text-[#172033] shadow-[8px_8px_0_#050816] sm:p-5"
        style={{ boxShadow: `8px 8px 0 #050816, 0 0 0 4px ${actor.accent}33` }}
      >
        <div className="flex flex-wrap items-center gap-2 border-b-4 border-[#172033] pb-3">
          <span
            className="rounded-md border-2 border-[#111827] px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-[3px_3px_0_#111827]"
            style={{ backgroundColor: actor.accent }}
          >
            {title ?? actor.name}
          </span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#5d667f]">
            {eyebrow}
          </span>
        </div>

        {isLoading ? (
          <div className="mt-4 flex items-center gap-3 text-sm font-black text-[#172033]">
            <span className="h-3 w-3 animate-pulse bg-[#172033]" />
            <span>{actor.name} đang gõ...</span>
          </div>
        ) : (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 whitespace-pre-line font-bold ${compact ? 'text-sm leading-7' : 'text-base leading-8 sm:text-xl sm:leading-10'}`}
          >
            “{text}”
          </motion.p>
        )}
      </div>
    </div>
  );
}
