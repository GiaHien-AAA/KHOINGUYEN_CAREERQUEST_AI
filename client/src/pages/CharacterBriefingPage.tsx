import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

import { CharacterPortrait } from '../components/CharacterPortrait';
import { PixelDialogBox } from '../components/PixelDialogBox';
import { PixelSceneBackground } from '../components/PixelSceneBackground';
import type { PlayerProfile } from './PlayerProfilePage';
import {
  getRoleplayActor,
  getRoleplayScenario,
  type RoleplayActorId,
  type RoleplayStageId,
} from '../game/roleplayScenarioData';
import { getRoleplayIntro, type RoleplayIntro } from '../services/roleplayService';

interface CharacterBriefingPageProps {
  stageId: RoleplayStageId;
  playerProfile: PlayerProfile;
  onBack: () => void;
  onAccept: (intro: RoleplayIntro) => void;
}

const sceneByActor: Partial<Record<RoleplayActorId, 'office' | 'client' | 'qa' | 'deadline' | 'team' | 'mentor'>> = {
  'boss-byte': 'office',
  'client-linh': 'client',
  'qa-an': 'qa',
  'pm-trang': 'deadline',
  'teammate-minh': 'team',
  'mentor-nova': 'mentor',
};

export function CharacterBriefingPage({ stageId, playerProfile, onBack, onAccept }: CharacterBriefingPageProps) {
  const scenario = getRoleplayScenario(stageId);
  const actor = scenario ? getRoleplayActor(scenario.actorId) : null;
  const [intro, setIntro] = useState<RoleplayIntro | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    void getRoleplayIntro(stageId, playerProfile).then((result) => {
      if (!cancelled) {
        setIntro(result);
        setIsLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [playerProfile, stageId]);

  if (!scenario || !actor) return null;

  const message = intro?.message ?? scenario.context;
  const missionTitle = intro?.missionTitle ?? scenario.missionTitle;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0d1024] px-3 py-5 text-white sm:px-6 sm:py-8">
      <PixelSceneBackground accent={actor.accent} scene={sceneByActor[actor.id] ?? 'office'} />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-40px)] w-full max-w-7xl flex-col justify-between gap-4">
        <header className="flex flex-wrap items-center justify-between gap-3 border-4 border-[#4d568c] bg-[#11162f]/90 px-4 py-3 shadow-[6px_6px_0_#070a17]">
          <div>
            <p className="text-[10px] font-black tracking-[0.32em] text-[#8be9fd] sm:text-xs">
              STAGE {scenario.stageNumber} / 6
            </p>
            <h1 className="mt-1 text-xl font-black text-[#ffe066] sm:text-2xl">
              {missionTitle}
            </h1>
          </div>

          <span
            className="border-2 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em]"
            style={{ borderColor: actor.accent, color: actor.accent }}
          >
            {actor.role.split('·')[0].trim()}
          </span>
        </header>

        <section className="grid flex-1 items-end gap-5 lg:grid-cols-[minmax(260px,440px)_minmax(0,1fr)]">
          <motion.aside
            initial={{ opacity: 0, x: -48 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 16 }}
            className="relative flex min-h-[420px] items-end justify-center overflow-visible"
          >
            <CharacterPortrait actor={actor} size="hero" mood="neutral" />
          </motion.aside>

          <motion.div
            initial={{ opacity: 0, x: 48 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 16, delay: 0.08 }}
            className="pb-3"
          >
            <PixelDialogBox
              actor={actor}
              eyebrow="NPC GIAO VIỆC"
              title={actor.name}
              text={message}
              isLoading={isLoading}
            />

            <div className="mt-4 flex flex-wrap gap-2">
              <Chip text={actor.workspace.split('·')[0].trim()} color={actor.accent} />
              <Chip text={scenario.mode === 'code' ? 'Training code' : 'Nói chuyện trực tiếp'} color="#8be9fd" />
              <Chip text={actor.mood} color="#ffe066" />
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onBack}
                className="border-4 border-[#7c83a8] bg-[#282d50] px-5 py-3 font-black shadow-[5px_5px_0_#070a17]"
              >
                ◀ QUAY LẠI
              </button>

              <button
                type="button"
                disabled={isLoading || !intro}
                onClick={() => intro && onAccept(intro)}
                className="pixel-button flex-1 px-6 py-4 text-base disabled:cursor-not-allowed disabled:opacity-50 sm:text-lg"
              >
                {isLoading ? 'NHÂN VẬT ĐANG BƯỚC VÀO...' : 'NHẬN VIỆC ▶'}
              </button>
            </div>
          </motion.div>
        </section>
      </div>
    </main>
  );
}

function Chip({ text, color }: { text: string; color: string }) {
  return (
    <span className="border-2 bg-[#0f1430]/95 px-3 py-2 text-xs font-black text-white shadow-[3px_3px_0_#050816]" style={{ borderColor: color }}>
      {text}
    </span>
  );
}
