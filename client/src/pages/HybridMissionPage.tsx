import { useRef, useState } from 'react';
import { motion } from 'motion/react';

import type { PlayerProfile } from './PlayerProfilePage';
import {
  MissionWorkspacePage,
  type DragCampaignResult,
} from './MissionWorkspacePage';
import { OpenRoleplayStage } from './OpenRoleplayStage';
import { openMissions } from '../game/hybridMissionData';
import type {
  HybridMissionResult,
  OpenAnswer,
  RoleplayTurn,
} from '../game/hybridMissionTypes';
import { evaluateCareer } from '../services/careerEvaluationService';

interface HybridMissionPageProps {
  playerProfile: PlayerProfile;
  onBack: () => void;
  onComplete: (result: HybridMissionResult) => void;
}

type HybridStep = 'drag-campaign' | 'open-roleplay' | 'evaluating' | 'error';

export function HybridMissionPage({
  playerProfile,
  onBack,
  onComplete,
}: HybridMissionPageProps) {
  const [currentStep, setCurrentStep] = useState<HybridStep>('drag-campaign');
  const [campaignResult, setCampaignResult] = useState<DragCampaignResult | null>(null);
  const [openMissionIndex, setOpenMissionIndex] = useState(0);
  const [openAnswers, setOpenAnswers] = useState<OpenAnswer[]>([]);
  const [openRoleplayTurns, setOpenRoleplayTurns] = useState<RoleplayTurn[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const evaluationStartedRef = useRef(false);

  function handleCampaignComplete(result: DragCampaignResult) {
    setCampaignResult(result);
    setOpenMissionIndex(0);
    setCurrentStep('open-roleplay');
  }

  function handleOpenStageComplete(result: {
    openAnswer: OpenAnswer;
    roleplayTurns: RoleplayTurn[];
  }) {
    const nextAnswers = saveOrReplaceAnswer(openAnswers, result.openAnswer);
    const nextTurns = [...openRoleplayTurns, ...result.roleplayTurns];

    setOpenAnswers(nextAnswers);
    setOpenRoleplayTurns(nextTurns);

    if (openMissionIndex < openMissions.length - 1) {
      setOpenMissionIndex((current) => current + 1);
      return;
    }

    void finishEvaluation(nextAnswers, nextTurns);
  }

  async function finishEvaluation(
    answers: OpenAnswer[],
    roleplayTurns: RoleplayTurn[],
  ) {
    if (!campaignResult || evaluationStartedRef.current) {
      return;
    }

    evaluationStartedRef.current = true;
    setErrorMessage('');
    setCurrentStep('evaluating');

    try {
      const analysis = await evaluateCareer({
        playerProfile,
        tutorialScore: campaignResult.score,
        tutorialAttempts: campaignResult.attemptsUsed,
        openAnswers: answers,
        roleplayTurns: [...campaignResult.roleplayTurns, ...roleplayTurns],
        behaviorEvents: campaignResult.behaviorEvents,
      });

      const openTime = answers.reduce((total, answer) => total + answer.timeTaken, 0);

      onComplete({
        pass: true,
        attemptsUsed: campaignResult.attemptsUsed,
        timeTaken: campaignResult.timeTaken + openTime,
        score: analysis.overallScore,
        analysis,
        openAnswers: answers,
        roleplayTurns: [...campaignResult.roleplayTurns, ...roleplayTurns],
        behaviorEvents: campaignResult.behaviorEvents,
      });
    } catch (error) {
      console.error('Career evaluation failed:', error);
      setErrorMessage(
        'Hệ thống chưa thể hoàn thành phân tích. Dữ liệu roleplay vẫn được giữ trong phiên hiện tại.',
      );
      setCurrentStep('error');
      evaluationStartedRef.current = false;
    }
  }

  if (currentStep === 'drag-campaign') {
    return (
      <MissionWorkspacePage
        playerProfile={playerProfile}
        onBack={onBack}
        onComplete={handleCampaignComplete}
      />
    );
  }

  if (currentStep === 'open-roleplay') {
    const mission = openMissions[openMissionIndex];

    return (
      <OpenRoleplayStage
        key={mission.id}
        mission={mission}
        playerProfile={playerProfile}
        onBack={
          openMissionIndex === 0
            ? onBack
            : () => setOpenMissionIndex((current) => Math.max(0, current - 1))
        }
        onComplete={handleOpenStageComplete}
      />
    );
  }

  if (currentStep === 'error') {
    return (
      <EvaluationErrorScreen
        message={errorMessage}
        onBack={() => setCurrentStep('open-roleplay')}
        onRetry={() => {
          evaluationStartedRef.current = false;
          void finishEvaluation(openAnswers, openRoleplayTurns);
        }}
      />
    );
  }

  return <EvaluationLoadingScreen playerName={playerProfile.fullName} />;
}

function EvaluationLoadingScreen({ playerName }: { playerName: string }) {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#0d1024] px-3 py-6 text-center text-white sm:px-6 sm:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-5xl items-center justify-center">
        <motion.section
          initial={{ opacity: 0, scale: 0.92, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full overflow-hidden border-4 border-[#8be9fd] bg-[#11162f] shadow-[8px_8px_0_#070a17]"
        >
          <div className="border-b-4 border-[#4d568c] bg-[#181d3a] p-4 sm:p-5">
            <p className="text-[10px] tracking-[0.3em] text-[#63e6a8] sm:text-xs">
              ALL 6 STAGES COMPLETE
            </p>
            <h1 className="mt-2 text-xl font-black text-[#ffe066] sm:text-3xl">
              AI CAREER ANALYSIS
            </h1>
          </div>

          <div className="p-6 sm:p-10">
            <div className="relative mx-auto flex h-32 w-32 items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 border-8 border-[#30375f] border-t-[#ffe066]"
              />
              <motion.div
                animate={{ scale: [0.9, 1.08, 0.9] }}
                transition={{ duration: 1.4, repeat: Infinity }}
                className="text-5xl"
              >
                🤖
              </motion.div>
            </div>

            <h2 className="mt-7 text-2xl font-black text-[#ffe066] sm:text-4xl">
              MENTOR NOVA ĐANG CHỐT HỒ SƠ...
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#c4c8e8] sm:text-base sm:leading-8">
              Mentor Nova đang lật lại log của <strong className="text-[#63e6a8]">{playerName}</strong>,
              xem cậu sửa sai ra sao, nói chuyện với team thế nào và có bị deadline làm rối nhịp không.
            </p>

            <div className="mx-auto mt-8 grid max-w-3xl gap-3 sm:grid-cols-3">
              {[
                ['🧩', 'Hành vi trong task'],
                ['🎭', 'Lịch sử roleplay'],
                ['📊', 'Hồ sơ năng lực'],
              ].map(([icon, label], index) => (
                <motion.div
                  key={label}
                  animate={{ opacity: [0.35, 1, 0.35] }}
                  transition={{ duration: 1.8, delay: index * 0.3, repeat: Infinity }}
                  className="border-2 border-[#4d568c] bg-[#181d3a] p-4"
                >
                  <p className="text-3xl">{icon}</p>
                  <p className="mt-2 text-xs leading-6 text-[#c4c8e8] sm:text-sm">{label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      </div>
      <CrtOverlay />
    </main>
  );
}

function EvaluationErrorScreen({
  message,
  onBack,
  onRetry,
}: {
  message: string;
  onBack: () => void;
  onRetry: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0d1024] px-3 py-8 text-white">
      <section className="w-full max-w-3xl border-4 border-[#ff5c7a] bg-[#11162f] p-5 shadow-[8px_8px_0_#070a17] sm:p-7">
        <p className="text-6xl text-center">🤖</p>
        <h1 className="mt-5 text-center text-xl font-black text-[#ffd6de] sm:text-2xl">
          CHƯA THỂ HOÀN THÀNH PHÂN TÍCH
        </h1>
        <p className="mt-4 text-center text-sm leading-7 text-[#c4c8e8] sm:text-base">{message}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onBack}
            className="border-4 border-[#7c83a8] bg-[#282d50] px-5 py-4 font-black"
          >
            ◀ QUAY LẠI
          </button>
          <button
            type="button"
            onClick={onRetry}
            className="flex-1 border-4 border-[#ffe066] bg-[#7c3aed] px-6 py-4 font-black shadow-[6px_6px_0_#000]"
          >
            ↻ PHÂN TÍCH LẠI
          </button>
        </div>
      </section>
    </main>
  );
}

function saveOrReplaceAnswer(current: OpenAnswer[], nextAnswer: OpenAnswer) {
  const index = current.findIndex((answer) => answer.stageId === nextAnswer.stageId);

  if (index === -1) {
    return [...current, nextAnswer];
  }

  const next = [...current];
  next[index] = nextAnswer;
  return next;
}

function CrtOverlay() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 opacity-[0.05]"
      style={{
        backgroundImage:
          'repeating-linear-gradient(to bottom, transparent 0px, transparent 3px, #000 4px)',
      }}
    />
  );
}
