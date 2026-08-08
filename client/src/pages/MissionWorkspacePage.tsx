import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

import { PixelSceneBackground } from '../components/PixelSceneBackground';
import type { PlayerProfile } from './PlayerProfilePage';
import { CharacterBriefingPage } from './CharacterBriefingPage';
import { campaignStages } from '../game/campaignData';
import { getRoleplayActor } from '../game/roleplayScenarioData';
import type {
  PlayerBehaviorEvent,
  RoleplayTurn,
} from '../game/hybridMissionTypes';
import {
  sendRoleplayTurn,
  type RoleplayIntro,
  type RoleplayReply,
} from '../services/roleplayService';

interface StageResult {
  stageNumber: number;
  attemptsUsed: number;
  timeTaken: number;
  score: number;
}

export interface DragCampaignResult {
  pass: boolean;
  attemptsUsed: number;
  timeTaken: number;
  score: number;
  roleplayTurns: RoleplayTurn[];
  behaviorEvents: PlayerBehaviorEvent[];
}

interface MissionWorkspacePageProps {
  playerProfile: PlayerProfile;
  onBack: () => void;
  onComplete: (result: DragCampaignResult) => void;
}

type MissionStatus = 'playing' | 'success' | 'failed';
type StageScreen = 'briefing' | 'workspace';

export function MissionWorkspacePage({
  playerProfile,
  onBack,
  onComplete,
}: MissionWorkspacePageProps) {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [stageScreen, setStageScreen] = useState<StageScreen>('briefing');
  const [stageIntro, setStageIntro] = useState<RoleplayIntro | null>(null);
  const [interactionId, setInteractionId] = useState('');
  const [codeText, setCodeText] = useState('');
  const [codeOutput, setCodeOutput] = useState('');
  const [attemptsUsed, setAttemptsUsed] = useState(0);
  const [timeLeft, setTimeLeft] = useState(campaignStages[0].timeLimit);
  const [missionStatus, setMissionStatus] = useState<MissionStatus>('playing');
  const [systemFeedback, setSystemFeedback] = useState('Đọc ví dụ, gõ code và chạy thử. Nếu lỗi, đọc lỗi rồi sửa.');
  const [roleplayOverlay, setRoleplayOverlay] = useState<RoleplayReply | null>(null);
  const [isRoleplayLoading, setIsRoleplayLoading] = useState(false);
  const [stageResult, setStageResult] = useState<StageResult | null>(null);
  const [stageResults, setStageResults] = useState<StageResult[]>([]);
  const [roleplayTurns, setRoleplayTurns] = useState<RoleplayTurn[]>([]);
  const [behaviorEvents, setBehaviorEvents] = useState<PlayerBehaviorEvent[]>([]);
  const timeoutTriggeredRef = useRef(false);

  const currentStage = campaignStages[currentStageIndex];

  useEffect(() => {
    setStageScreen('briefing');
    setStageIntro(null);
    setInteractionId('');
    setCodeText(currentStage.codeStarter || '');
    setCodeOutput('');
    setAttemptsUsed(0);
    setTimeLeft(currentStage.timeLimit);
    setMissionStatus('playing');
    setSystemFeedback(currentStage.stageNumber === 1
      ? 'Đây là bài training. Gõ lại code mẫu rồi chạy thử.'
      : 'Không cần đoán. Hãy chạy thử, đọc kết quả và sửa từng bước.');
    setRoleplayOverlay(null);
    setIsRoleplayLoading(false);
    setStageResult(null);
    timeoutTriggeredRef.current = false;
  }, [currentStage.id, currentStage.timeLimit, currentStage.stageNumber]);

  useEffect(() => {
    if (stageScreen !== 'workspace' || missionStatus !== 'playing' || roleplayOverlay || isRoleplayLoading) {
      return;
    }

    const timer = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          if (!timeoutTriggeredRef.current) {
            timeoutTriggeredRef.current = true;
            window.setTimeout(() => void handleTimeExpired(), 0);
          }
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [stageScreen, missionStatus, roleplayOverlay, isRoleplayLoading]);

  function recordBehavior(
    eventType: PlayerBehaviorEvent['eventType'],
    attemptNumber = attemptsUsed,
  ) {
    setBehaviorEvents((current) => [
      ...current,
      {
        stageId: currentStage.id,
        stageNumber: currentStage.stageNumber,
        eventType,
        attemptNumber,
        blockSequence: [codeText],
        timeRemaining: timeLeft,
      },
    ]);
  }

  function normalizeCode(value: string) {
    return value
      .trim()
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
      .replace(/\r/g, '');
  }

  function validateCode(code: string): { ok: boolean; output: string; error?: string } {
    const normalized = normalizeCode(code);
    if (!normalized) {
      return { ok: false, output: '', error: 'Bạn chưa viết code. Hãy nhập code rồi bấm CHẠY THỬ.' };
    }

    if (currentStage.id === 'drag-stage-1') {
      const ok = /^print\s*\(\s*["']Hello World!["']\s*\)\s*$/.test(normalized);
      return ok
        ? { ok: true, output: 'Hello World!' }
        : { ok: false, output: 'SyntaxError / kết quả chưa đúng', error: currentStage.codeErrorHint };
    }

    if (currentStage.id === 'drag-stage-2') {
      const hasInput = /\bname\s*=\s*input\s*\(/i.test(normalized);
      const hasPrint = /\bprint\s*\(/i.test(normalized);
      const hasGreeting = /Xin chào/i.test(normalized);
      const usesName = /print\s*\([^\n]*\bname\b/i.test(normalized) || /f["']Xin chào\s*\{name\}/i.test(normalized);
      if (hasInput && hasPrint && hasGreeting && usesName) {
        return { ok: true, output: 'Tên của bạn: Hưng\nXin chào Hưng' };
      }
      return { ok: false, output: 'Chương trình chưa cho ra kết quả mong muốn.', error: currentStage.codeErrorHint };
    }

    if (currentStage.id === 'drag-stage-3') {
      if (/\bnane\b/.test(normalized)) {
        return {
          ok: false,
          output: "NameError: name 'nane' is not defined",
          error: 'Lỗi đang nằm ở tên biến. Ở dòng trên bạn tạo biến `name`, nhưng dòng dưới lại dùng `nane`.',
        };
      }
      const hasInput = /\bname\s*=\s*input\s*\(/i.test(normalized);
      const hasPrint = /\bprint\s*\(/i.test(normalized);
      const usesName = /print\s*\([^\n]*\bname\b/i.test(normalized) || /f["']Xin chào\s*\{name\}/i.test(normalized);
      if (hasInput && hasPrint && usesName) {
        return { ok: true, output: 'Tên của bạn: Hưng\nXin chào Hưng' };
      }
      return { ok: false, output: 'Code vẫn chưa chạy đúng.', error: currentStage.codeErrorHint };
    }

    return { ok: false, output: 'Không nhận diện được bài code này.', error: 'Hãy làm theo hướng dẫn của bài.' };
  }

  async function handleCodeRun() {
    if (missionStatus !== 'playing' || isRoleplayLoading) return;

    const nextAttempts = attemptsUsed + 1;
    setAttemptsUsed(nextAttempts);
    const result = validateCode(codeText);
    setCodeOutput(result.output);

    if (!result.ok) {
      recordBehavior('wrong_attempt', nextAttempts);
      setSystemFeedback(result.error || currentStage.codeHint || 'Hãy đọc lỗi và thử sửa lại.');
      const usedAllAttempts = nextAttempts >= currentStage.maxAttempts;
      setMissionStatus(usedAllAttempts ? 'failed' : 'playing');
      await requestRoleplayFeedback({
        eventType: 'wrong_attempt',
        attemptNumber: nextAttempts,
        fallbackComplete: false,
      });
      return;
    }

    recordBehavior('correct_attempt', nextAttempts);
    const timeTaken = currentStage.timeLimit - timeLeft;
    const score = calculateStageScore(nextAttempts, timeTaken, currentStage.timeLimit);
    setStageResult({ stageNumber: currentStage.stageNumber, attemptsUsed: nextAttempts, timeTaken, score });
    setMissionStatus('success');
    setSystemFeedback(currentStage.stageNumber === 3
      ? 'Bug đã được sửa. Bạn đã đi đúng quy trình: chạy → đọc lỗi → sửa → chạy lại.'
      : 'Chạy thành công. Bạn vừa hoàn thành bước này.');
    await requestRoleplayFeedback({
      eventType: 'success_attempt',
      attemptNumber: nextAttempts,
      fallbackComplete: true,
    });
  }

  async function requestRoleplayFeedback({
    eventType,
    attemptNumber,
    fallbackComplete,
  }: {
    eventType: 'wrong_attempt' | 'success_attempt';
    attemptNumber: number;
    fallbackComplete: boolean;
  }) {
    setIsRoleplayLoading(true);
    try {
      const reply = await sendRoleplayTurn({
        stageId: currentStage.id,
        playerProfile,
        previousInteractionId: interactionId || stageIntro?.interactionId,
        eventType,
        playerAction: [codeText],
        attemptNumber,
        timeTaken: currentStage.timeLimit - timeLeft,
      });

      setInteractionId(reply.interactionId || interactionId);
      setRoleplayOverlay({ ...reply, stageComplete: fallbackComplete ? true : reply.stageComplete });
      setRoleplayTurns((current) => [
        ...current,
        {
          stageId: currentStage.id,
          stageNumber: currentStage.stageNumber,
          actorId: reply.actorId,
          actorName: reply.actorName,
          actorRole: reply.actorRole,
          aiMessage: reply.message,
          playerResponse: `CODE:\n${codeText}`,
          eventType,
          timeTaken: currentStage.timeLimit - timeLeft,
          observation: reply.observation,
        },
      ]);
    } finally {
      setIsRoleplayLoading(false);
    }
  }

  async function handleTimeExpired() {
    if (missionStatus !== 'playing') return;
    setMissionStatus('failed');
    setSystemFeedback('Hết thời gian. Hãy xem lại cách bạn đọc lỗi và xử lý code.');
    await requestRoleplayFeedback({
      eventType: 'wrong_attempt',
      attemptNumber: attemptsUsed + 1,
      fallbackComplete: false,
    });
  }

  function retryStage() {
    recordBehavior('retry_stage', 0);
    setCodeText(currentStage.codeStarter || '');
    setCodeOutput('');
    setAttemptsUsed(0);
    setTimeLeft(currentStage.timeLimit);
    setMissionStatus('playing');
    setRoleplayOverlay(null);
    setStageResult(null);
    setSystemFeedback('Thử lại. Đừng đoán; hãy chạy code và đọc kết quả.');
    timeoutTriggeredRef.current = false;
  }

  function continueAfterSuccess() {
    if (!stageResult) return;
    const nextResults = [...stageResults, stageResult];
    setStageResults(nextResults);
    setRoleplayOverlay(null);

    if (currentStageIndex < campaignStages.length - 1) {
      setCurrentStageIndex((current) => current + 1);
      return;
    }

    finishCampaign(nextResults);
  }

  function finishCampaign(results: StageResult[]) {
    const totalAttempts = results.reduce((total, result) => total + result.attemptsUsed, 0);
    const totalTime = results.reduce((total, result) => total + result.timeTaken, 0);
    const weightedScore = results.reduce(
      (total, result, index) => total + result.score * campaignStages[index].weight,
      0,
    );

    onComplete({
      pass: true,
      attemptsUsed: totalAttempts,
      timeTaken: totalTime,
      score: Math.round(weightedScore),
      roleplayTurns,
      behaviorEvents,
    });
  }

  if (stageScreen === 'briefing') {
    return (
      <CharacterBriefingPage
        stageId={currentStage.id}
        playerProfile={playerProfile}
        onBack={onBack}
        onAccept={(intro) => {
          setStageIntro(intro);
          setInteractionId(intro.interactionId);
          setStageScreen('workspace');
        }}
      />
    );
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#0d1024] px-3 py-4 text-white sm:px-5 sm:py-6 lg:px-8">
      <PixelSceneBackground accent="#8be9fd" scene="office" />
      <div className="relative z-10 mx-auto w-full max-w-[1500px]">
        <TopHud
          playerName={playerProfile.fullName}
          currentStage={currentStageIndex + 1}
          timeLeft={timeLeft}
          attemptsUsed={attemptsUsed}
          maxAttempts={currentStage.maxAttempts}
        />
        <CampaignProgress currentStageIndex={currentStageIndex} />

        <section className="mt-5 overflow-hidden border-4 border-[#8be9fd] bg-[#11162f] shadow-[6px_6px_0_#070a17] sm:shadow-[10px_10px_0_#070a17]">
          <div className="border-b-4 border-[#4d568c] bg-[#181d3a] p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] tracking-[0.25em] text-[#8be9fd] sm:text-xs">TRAINING CODE · {stageIntro?.actorName}</p>
                <h1 className="mt-2 text-xl font-black text-[#ffe066] sm:text-3xl">{currentStage.title}</h1>
              </div>
              <span className="w-fit border-2 border-[#ffe066] bg-[#7c3aed] px-3 py-2 text-xs font-black">
                {currentStage.stageNumber === 1 ? 'TRAINING' : 'FRESHER'}
              </span>
            </div>
          </div>

          <div className="grid gap-5 p-3 sm:p-5 lg:grid-cols-[330px_minmax(0,1fr)]">
            <aside className="space-y-4">
              <MissionDescription
                objective={currentStage.objective}
                explanation={currentStage.explanation}
                testCase={currentStage.testCase}
                expectedOutput={currentStage.expectedOutput}
              />
              <CodeTrainingGuide
                example={currentStage.codeExample || ''}
                hint={currentStage.codeHint || ''}
                stageNumber={currentStage.stageNumber}
              />
            </aside>

            <div className="min-w-0 space-y-4">
              <CodeEditor
                value={codeText}
                output={codeOutput}
                disabled={missionStatus !== 'playing' || isRoleplayLoading}
                onChange={setCodeText}
                onRun={() => void handleCodeRun()}
              />

              <div className="border-4 border-[#4d568c] bg-[#181d3a] p-4">
                <p className="text-[10px] tracking-[0.25em] text-[#8be9fd] sm:text-xs">SYSTEM FEEDBACK</p>
                <p className="mt-2 text-sm font-bold leading-6 sm:text-base">
                  {isRoleplayLoading ? 'Boss/đồng đội đang xem cách bạn xử lý...' : systemFeedback}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <button type="button" onClick={onBack} className="cursor-pointer border-4 border-[#7c83a8] bg-[#282d50] px-4 py-3 font-black">
                  ◀ QUAY LẠI
                </button>
                <button
                  type="button"
                  disabled={missionStatus !== 'playing' || isRoleplayLoading}
                  onClick={() => { setCodeText(currentStage.codeStarter || ''); setCodeOutput(''); }}
                  className="cursor-pointer border-4 border-[#ffb84d] bg-[#5b3718] px-4 py-3 font-black disabled:opacity-40"
                >
                  ↻ ĐẶT LẠI CODE
                </button>
                <motion.button
                  type="button"
                  disabled={missionStatus !== 'playing' || isRoleplayLoading}
                  onClick={() => void handleCodeRun()}
                  whileHover={missionStatus === 'playing' ? { y: -4 } : undefined}
                  className="cursor-pointer border-4 border-[#ffe066] bg-[#7c3aed] px-4 py-3 font-black shadow-[5px_5px_0_#000] disabled:opacity-40"
                >
                  ▶ CHẠY THỬ
                </motion.button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {(roleplayOverlay || isRoleplayLoading) && (
        <RoleplayFeedbackOverlay
          reply={roleplayOverlay}
          isLoading={isRoleplayLoading}
          status={missionStatus}
          isFinalStage={currentStageIndex === campaignStages.length - 1}
          onTryAgain={() => setRoleplayOverlay(null)}
          onRetryStage={retryStage}
          onContinue={continueAfterSuccess}
        />
      )}
      <CrtOverlay />
    </main>
  );
}

function calculateStageScore(attempts: number, timeTaken: number, timeLimit: number) {
  const attemptPenalty = Math.max(0, attempts - 1) * 10;
  const timeRatio = Math.min(1, timeTaken / Math.max(1, timeLimit));
  const timePenalty = Math.round(timeRatio * 20);
  return Math.max(45, 100 - attemptPenalty - timePenalty);
}

function TopHud({ playerName, currentStage, timeLeft, attemptsUsed, maxAttempts }: {
  playerName: string; currentStage: number; timeLeft: number; attemptsUsed: number; maxAttempts: number;
}) {
  return (
    <header className="border-4 border-[#4d568c] bg-[#181d3a] p-3 shadow-[5px_5px_0_#070a17] sm:p-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-[10px] tracking-[0.25em] text-[#8be9fd] sm:text-xs">PIXEL TECH CORP · AI TRAINING</p>
          <h1 className="mt-2 text-xl font-black text-[#ffe066] sm:text-3xl">CODE QUEST</h1>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <HudBox label="PLAYER" value={playerName} />
          <HudBox label="BÀI" value={`${currentStage} / 3`} />
          <HudBox label="TIME" value={formatTime(timeLeft)} />
          <HudBox label="LẦN CHẠY" value={`${attemptsUsed} / ${maxAttempts}`} />
        </div>
      </div>
    </header>
  );
}

function HudBox({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0 border-2 border-[#4d568c] bg-[#0f1430] px-2 py-2 text-center"><p className="text-[8px] tracking-wider text-[#8be9fd]">{label}</p><p className="mt-1 truncate text-xs font-black text-[#ffe066] sm:text-sm">{value}</p></div>;
}

function CampaignProgress({ currentStageIndex }: { currentStageIndex: number }) {
  return <div className="mt-4 grid grid-cols-3 gap-2 sm:mt-6 sm:gap-3">{campaignStages.map((stage, index) => <div key={stage.id} className={['border-2 p-2 text-center sm:border-4 sm:p-3', index === currentStageIndex ? 'border-[#ffe066] bg-[#7c3aed]' : index < currentStageIndex ? 'border-[#63e6a8] bg-[#16382d]' : 'border-[#4d568c] bg-[#181d3a]'].join(' ')}><p className="text-[9px] tracking-wider sm:text-xs">BÀI {stage.stageNumber}</p><p className="mt-1 text-[10px] font-black sm:text-sm">{index < currentStageIndex ? '✓ DONE' : stage.difficulty}</p></div>)}</div>;
}

function MissionDescription({ objective, explanation, testCase, expectedOutput }: { objective: string; explanation: string; testCase: string; expectedOutput: string }) {
  return <div className="border-4 border-[#7c3aed] bg-[#211944] p-4"><p className="text-[10px] tracking-[0.25em] text-[#8be9fd] sm:text-xs">BẠN CẦN LÀM GÌ?</p><p className="mt-3 text-sm leading-6 text-[#e4e6ff] sm:text-base sm:leading-7">{objective}</p><p className="mt-3 border-l-4 border-[#7c83a8] pl-3 text-xs leading-6 text-[#aeb4dc] sm:text-sm">{explanation}</p><div className="mt-4 border-l-4 border-[#ffe066] bg-[#181d3a] p-3"><p className="text-xs text-[#8be9fd] sm:text-sm">{testCase}</p><p className="mt-2 font-black text-[#63e6a8]">{expectedOutput}</p></div></div>;
}

function CodeTrainingGuide({ example, hint, stageNumber }: { example: string; hint: string; stageNumber: number }) {
  return <div className="border-4 border-[#63e6a8] bg-[#16382d] p-4"><p className="text-[10px] tracking-[0.25em] text-[#8be9fd] sm:text-xs">{stageNumber === 1 ? 'TRAINING · LÀM MẪU' : 'HƯỚNG DẪN · FRESHER'}</p><p className="mt-3 text-sm font-black leading-6 text-white">{stageNumber === 3 ? 'Chạy trước, đọc lỗi, sửa rồi chạy lại.' : 'Nhìn ví dụ → tự gõ → chạy thử → kiểm tra kết quả.'}</p>{example && <><p className="mt-4 text-xs font-bold text-[#d9ffe9]">CODE MẪU</p><pre className="mt-2 overflow-x-auto rounded-xl bg-[#08140f] p-3 text-xs leading-6 text-[#63e6a8]">{example}</pre></>}<p className="mt-3 text-xs font-bold text-[#ffe066]">{hint}</p></div>;
}

function CodeEditor({ value, output, disabled, onChange, onRun }: { value: string; output: string; disabled: boolean; onChange: (value: string) => void; onRun: () => void }) {
  return <div className="border-4 border-[#4d568c] bg-[#0c1025] p-3 sm:p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[10px] tracking-[0.25em] text-[#8be9fd] sm:text-xs">CODE EDITOR</p><h2 className="mt-2 text-lg font-black text-[#ffe066]">Viết code của bạn</h2></div><span className="border-2 border-[#63e6a8] bg-[#10271e] px-3 py-1 text-[10px] font-black text-[#63e6a8]">PYTHON CƠ BẢN · MÔ PHỎNG</span></div><textarea value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} spellCheck={false} className="mt-4 min-h-[280px] w-full resize-y border-2 border-[#4d568c] bg-[#050817] p-4 font-mono text-sm leading-7 text-[#d9ffe9] outline-none focus:border-[#ffe066] disabled:opacity-60" aria-label="Ô nhập code" placeholder="Gõ code tại đây..." /><div className="mt-3 flex flex-wrap items-center gap-3"><button type="button" onClick={onRun} disabled={disabled} className="cursor-pointer border-2 border-[#ffe066] bg-[#7c3aed] px-5 py-3 text-sm font-black text-white disabled:opacity-40">▶ CHẠY THỬ</button><span className="text-xs font-bold text-[#9fa8d8]">Chạy thử không làm hỏng máy; game chỉ kiểm tra bài code này.</span></div>{output && <pre className="mt-4 whitespace-pre-wrap border-2 border-[#63e6a8]/40 bg-[#10271e] p-3 font-mono text-sm font-bold text-[#63e6a8]">{output}</pre>}</div>;
}

function RoleplayFeedbackOverlay({ reply, isLoading, status, isFinalStage, onTryAgain, onRetryStage, onContinue }: { reply: RoleplayReply | null; isLoading: boolean; status: MissionStatus; isFinalStage: boolean; onTryAgain: () => void; onRetryStage: () => void; onContinue: () => void }) {
  const actor = reply ? getRoleplayActor(reply.actorId) : null;
  const accent = actor?.accent ?? '#ffe066';
  return <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#050711]/90 p-3 backdrop-blur-sm sm:p-6"><div className="flex min-h-full items-center justify-center py-4"><motion.section initial={{ opacity: 0, scale: 0.92, y: 25 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="w-full max-w-5xl overflow-hidden border-4 bg-[#11162f] shadow-[8px_8px_0_#000]" style={{ borderColor: accent }}><div className="border-b-4 border-[#4d568c] bg-[#181d3a] p-4 sm:p-5"><p className="text-[10px] tracking-[0.3em] text-[#8be9fd] sm:text-xs">FEEDBACK TỪ {reply?.actorName || 'MENTOR'}</p><h2 className="mt-2 text-xl font-black text-[#ffe066] sm:text-2xl">{isLoading ? 'ĐANG XEM CÁCH BẠN XỬ LÝ...' : status === 'success' ? 'CHẠY ĐÚNG RỒI' : 'HÃY XEM LẠI LỖI'}</h2></div><div className="grid gap-5 p-4 sm:p-6 lg:grid-cols-[220px_minmax(0,1fr)]">{actor && <div className="border-4 border-[#4d568c] bg-[#181d3a] p-4 text-center"><div className="mx-auto flex h-28 w-28 items-center justify-center border-4 border-[#4d568c] bg-[#0f1430] text-6xl">{actor.avatar}</div><p className="mt-3 font-black text-[#ffe066]">{actor.name}</p><p className="mt-1 text-xs text-[#aeb4dc]">{actor.role}</p></div>}<div><div className="min-h-[150px] border-4 border-[#4d568c] bg-[#0c1025] p-4"><p className="text-sm leading-7 text-[#e4e6ff]">{isLoading ? 'Đang phản hồi...' : reply?.message || 'Chưa có phản hồi.'}</p>{reply?.hint && <p className="mt-4 border-l-4 border-[#ffe066] pl-3 text-xs leading-6 text-[#ffe066]">Gợi ý: {reply.hint}</p>}</div><div className="mt-4 flex flex-col gap-3 sm:flex-row">{status === 'success' ? <button type="button" onClick={onContinue} className="cursor-pointer flex-1 border-4 border-[#63e6a8] bg-[#16382d] px-5 py-4 font-black">{isFinalStage ? 'HOÀN THÀNH TRAINING ▶' : 'BÀI TIẾP THEO ▶'}</button> : <><button type="button" onClick={onTryAgain} className="cursor-pointer flex-1 border-4 border-[#8be9fd] bg-[#14263b] px-5 py-4 font-black">ĐÓNG & SỬA CODE</button><button type="button" onClick={onRetryStage} className="cursor-pointer border-4 border-[#ffb84d] bg-[#5b3718] px-5 py-4 font-black">↻ LÀM LẠI</button></>}</div></div></div></motion.section></div></div>;
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = Math.max(0, totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function CrtOverlay() {
  return <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.05]" style={{ backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0px, transparent 3px, #000 4px)' }} />;
}
