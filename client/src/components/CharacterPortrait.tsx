import { motion } from 'motion/react';

import type { RoleplayActor, RoleplayActorId } from '../game/roleplayScenarioData';

export type CharacterMood = 'neutral' | 'happy' | 'warning' | 'angry';

interface CharacterPortraitProps {
  actor: RoleplayActor;
  size?: 'compact' | 'large' | 'hero';
  mood?: CharacterMood | string;
  isThinking?: boolean;
  showNameplate?: boolean;
}

const sizeMap = {
  compact: 'h-36 sm:h-44',
  large: 'h-72 sm:h-[21rem] lg:h-[24rem]',
  hero: 'h-80 sm:h-[25rem] lg:h-[31rem]',
};

const characterMoodLabel: Record<CharacterMood, string> = {
  neutral: 'ĐANG NGHE',
  happy: 'ỔN ĐẤY',
  warning: 'CĂNG RỒI',
  angry: 'BỰC RỒI',
};

function normalizeMood(mood?: CharacterMood | string): CharacterMood {
  if (mood === 'happy' || mood === 'neutral' || mood === 'warning' || mood === 'angry') {
    return mood;
  }

  const text = String(mood ?? '').toLowerCase();

  if (
    text.includes('angry') ||
    text.includes('mad') ||
    text.includes('rage') ||
    text.includes('furious') ||
    text.includes('phẫn nộ') ||
    text.includes('bực') ||
    text.includes('irritated') ||
    text.includes('upset') ||
    text.includes('failed')
  ) {
    return 'angry';
  }

  if (
    text.includes('wrong') ||
    text.includes('warning') ||
    text.includes('serious') ||
    text.includes('critical') ||
    text.includes('challenging') ||
    text.includes('concerned') ||
    text.includes('stressed') ||
    text.includes('worried') ||
    text.includes('thoughtful')
  ) {
    return 'warning';
  }

  if (
    text.includes('happy') ||
    text.includes('success') ||
    text.includes('encouraging') ||
    text.includes('approve') ||
    text.includes('pleased') ||
    text.includes('satisfied') ||
    text.includes('kind') ||
    text.includes('support')
  ) {
    return 'happy';
  }

  return 'neutral';
}

export function getCharacterSpritePath(actorId: RoleplayActorId, mood?: CharacterMood | string) {
  return `/characters/${actorId}/${normalizeMood(mood)}.png`;
}

export function CharacterPortrait({
  actor,
  size = 'large',
  mood = 'neutral',
  isThinking = false,
  showNameplate = true,
}: CharacterPortraitProps) {
  const activeMood = normalizeMood(mood);
  const glowColor = activeMood === 'angry' ? '#ff2f5f' : activeMood === 'warning' ? '#ffb84d' : activeMood === 'happy' ? '#63e6a8' : actor.accent;

  return (
    <div className="relative mx-auto flex w-full max-w-[380px] justify-center">
      <motion.div
        animate={isThinking ? { y: [0, -6, 0], rotate: [-0.8, 0.8, -0.8] } : { y: [0, -9, 0] }}
        transition={{ duration: isThinking ? 1.2 : 2.4, repeat: Infinity, ease: 'easeInOut' }}
        className="relative"
      >
        <div
          className="absolute inset-x-8 bottom-3 h-8 rounded-full blur-xl"
          style={{ backgroundColor: `${glowColor}55` }}
        />

        <img
          src={getCharacterSpritePath(actor.id, activeMood)}
          alt={actor.name}
          className={`${sizeMap[size]} relative z-10 w-auto object-contain drop-shadow-[8px_10px_0_rgba(0,0,0,0.5)]`}
          style={{ imageRendering: 'pixelated' }}
          draggable={false}
        />

        <motion.div
          animate={{ opacity: [0.3, 0.95, 0.3], scale: [0.98, 1.03, 0.98] }}
          transition={{ duration: 1.7, repeat: Infinity }}
          className="absolute -right-1 top-8 z-20 border-2 border-[#070a17] px-2 py-1 text-[10px] font-black shadow-[4px_4px_0_#070a17] sm:text-xs"
          style={{ backgroundColor: glowColor, color: '#0d1024' }}
        >
          {characterMoodLabel[activeMood]}
        </motion.div>

        {showNameplate && (
          <div
            className="absolute -bottom-3 left-1/2 z-20 w-[86%] -translate-x-1/2 border-4 border-[#070a17] bg-[#0f1430] px-3 py-2 text-center shadow-[5px_5px_0_#070a17]"
            style={{ boxShadow: `5px 5px 0 #070a17, 0 0 20px ${actor.accent}44` }}
          >
            <p className="truncate text-[10px] font-black tracking-[0.22em] text-[#ffe066] sm:text-xs">
              {actor.name}
            </p>
            <p className="mt-1 truncate text-[9px] font-bold text-[#8be9fd] sm:text-[10px]">
              {actor.statusLabel}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
