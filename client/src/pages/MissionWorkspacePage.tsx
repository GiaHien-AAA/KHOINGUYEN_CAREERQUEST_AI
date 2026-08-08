import {
  useEffect,
  useRef,
  useState,
  type DragEvent,
} from 'react';
import { motion } from 'motion/react';

import { CharacterPortrait } from '../components/CharacterPortrait';
import { PixelSceneBackground } from '../components/PixelSceneBackground';
import type { PlayerProfile } from './PlayerProfilePage';
import { CharacterBriefingPage } from './CharacterBriefingPage';
import {
  blockInfo,
  campaignStages,
  type BlockType,
} from '../game/campaignData';
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

interface WorkspaceBlock {
  id: string;
  type: BlockType;
}

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
  const [workspaceBlocks, setWorkspaceBlocks] = useState<WorkspaceBlock[]>([]);
  const [codeText, setCodeText] = useState('');
  const [codeOutput, setCodeOutput] = useState('');
  const [attemptsUsed, setAttemptsUsed] = useState(0);
  const [timeLeft, setTimeLeft] = useState(campaignStages[0].timeLimit);
  const [missionStatus, setMissionStatus] = useState<MissionStatus>('playing');
  const [systemFeedback, setSystemFeedback] = useState(
    'Kéo block trên desktop hoặc chạm vào block trên mobile/tablet.',
  );
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
    setWorkspaceBlocks([]);
    setCodeText(currentStage.codeStarter || '');
    setCodeOutput('');
    setAttemptsUsed(0);
    setTimeLeft(currentStage.timeLimit);
    setMissionStatus('playing');
    setSystemFeedback('Kéo block trên desktop hoặc chạm vào block trên mobile/tablet.');
    setRoleplayOverlay(null);
    setIsRoleplayLoading(false);
    setStageResult(null);
    timeoutTriggeredRef.current = false;
  }, [currentStage.id, currentStage.timeLimit]);

  useEffect(() => {
    if (
      stageScreen !== 'workspace' ||
      missionStatus !== 'playing' ||
      roleplayOverlay ||
      isRoleplayLoading
    ) {
      return;
    }

    const timer = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer);

          if (!timeoutTriggeredRef.current) {
            timeoutTriggeredRef.current = true;
            window.setTimeout(() => {
              void handleTimeExpired();
            }, 0);
          }

          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [stageScreen, missionStatus, roleplayOverlay, isRoleplayLoading]);

  function createWorkspaceBlock(type: BlockType): WorkspaceBlock {
    return {
      id:
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `${type}-${Date.now()}-${Math.random()}`,
      type,
    };
  }

  function recordBehavior(
    eventType: PlayerBehaviorEvent['eventType'],
    blockSequence = workspaceBlocks.map((block) => block.type),
    attemptNumber = attemptsUsed,
  ) {
    setBehaviorEvents((current) => [
      ...current,
      {
        stageId: currentStage.id,
        stageNumber: currentStage.stageNumber,
        eventType,
        attemptNumber,
        blockSequence,
        timeRemaining: timeLeft,
      },
    ]);
  }

  function addBlock(blockType: BlockType) {
    if (missionStatus !== 'playing' || isRoleplayLoading || roleplayOverlay) {
      return;
    }

    setWorkspaceBlocks((current) => [...current, createWorkspaceBlock(blockType)]);
    recordBehavior('block_added', [...workspaceBlocks.map((block) => block.type), blockType]);
    setSystemFeedback(`${blockInfo[blockType].title} đã được thêm vào Workspace.`);
  }

  function handleDragStart(
    event: DragEvent<HTMLDivElement>,
    blockType: BlockType,
  ) {
    event.dataTransfer.setData('blockType', blockType);
    event.dataTransfer.effectAllowed = 'copy';
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const blockType = event.dataTransfer.getData('blockType') as BlockType;

    if (blockType && currentStage.availableBlocks.includes(blockType)) {
      addBlock(blockType);
    }
  }

  function removeBlock(blockId: string) {
    if (missionStatus !== 'playing') {
      return;
    }

    const nextBlocks = workspaceBlocks.filter((block) => block.id !== blockId);
    setWorkspaceBlocks(nextBlocks);
    recordBehavior(
      'block_removed',
      nextBlocks.map((block) => block.type),
    );
  }

  function moveBlock(index: number, direction: 'up' | 'down') {
    if (missionStatus !== 'playing') {
      return;
    }

    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= workspaceBlocks.length) {
      return;
    }

    const nextBlocks = [...workspaceBlocks];
    [nextBlocks[index], nextBlocks[targetIndex]] = [
      nextBlocks[targetIndex],
      nextBlocks[index],
    ];

    setWorkspaceBlocks(nextBlocks);
    recordBehavior(
      'block_moved',
      nextBlocks.map((block) => block.type),
    );
  }

  function resetWorkspace() {
    if (missionStatus === 'playing') {
      setWorkspaceBlocks([]);
      setSystemFeedback('Workspace đã được làm sạch.');
    }
  }

  async function handleCodeRun() {
    if (missionStatus !== 'playing' || isRoleplayLoading) return;

    const normalized = codeText
      .trim()
      .replace(/\s+/g, '')
      .replace(/;$/, '');
    const expected = String(currentStage.codeExpected || '')
      .trim()
      .replace(/\s+/g, '')
      .replace(/;$/, '');
    const nextAttempts = attemptsUsed + 1;
    setAttemptsUsed(nextAttempts);

    if (!codeText.trim()) {
      setSystemFeedback('Bạn chưa viết code. Hãy nhập câu lệnh rồi bấm CHẠY THỬ.');
      return;
    }

    const isCorrect = normalized === expected;
    if (!isCorrect) {
      recordBehavior('wrong_attempt', [], nextAttempts);
      setCodeOutput('Có lỗi: kết quả chưa đúng. Kiểm tra tên hàm, dấu ngoặc kép và nội dung cần in.');
      setSystemFeedback(currentStage.codeHint || 'Hãy kiểm tra lại câu lệnh và chạy thử lần nữa.');
      const usedAllAttempts = nextAttempts >= currentStage.maxAttempts;
      setMissionStatus(usedAllAttempts ? 'failed' : 'playing');
      await requestRoleplayFeedback({
        eventType: 'wrong_attempt',
        playerAction: [],
        attemptNumber: nextAttempts,
        fallbackComplete: false,
      });
      return;
    }

    recordBehavior('correct_attempt', [], nextAttempts);
    const timeTaken = currentStage.timeLimit - timeLeft;
    const score = calculateStageScore(nextAttempts, timeTaken, currentStage.timeLimit);
    setCodeOutput(currentStage.expectedOutput);
    setStageResult({ stageNumber: currentStage.stageNumber, attemptsUsed: nextAttempts, timeTaken, score });
    setMissionStatus('success');
    setSystemFeedback('Chạy thành công. Bạn vừa hoàn thành bước training đầu tiên.');
    await requestRoleplayFeedback({
      eventType: 'success_attempt',
      playerAction: [],
      attemptNumber: nextAttempts,
      fallbackComplete: true,
    });
  }

  async function handleRun() {
    if (missionStatus !== 'playing' || isRoleplayLoading) {
      return;
    }

    if (workspaceBlocks.length === 0) {
      setSystemFeedback('Workspace đang trống. Hãy thêm block trước khi chạy.');
      return;
    }

    const solution = workspaceBlocks.map((block) => block.type);
    const nextAttempts = attemptsUsed + 1;
    const isCorrect = compareSolutions(solution, currentStage.correctSolution);

    setAttemptsUsed(nextAttempts);

    if (!isCorrect) {
      recordBehavior('wrong_attempt', solution, nextAttempts);

      const usedAllAttempts = nextAttempts >= currentStage.maxAttempts;
      setMissionStatus(usedAllAttempts ? 'failed' : 'playing');
      setSystemFeedback(getFailureFeedback(solution, currentStage.correctSolution));

      await requestRoleplayFeedback({
        eventType: 'wrong_attempt',
        playerAction: solution,
        attemptNumber: nextAttempts,
        fallbackComplete: false,
      });
      return;
    }

    recordBehavior('correct_attempt', solution, nextAttempts);

    const timeTaken = currentStage.timeLimit - timeLeft;
    const score = calculateStageScore(nextAttempts, timeTaken, currentStage.timeLimit);
    const result: StageResult = {
      stageNumber: currentStage.stageNumber,
      attemptsUsed: nextAttempts,
      timeTaken,
      score,
    };

    setStageResult(result);
    setMissionStatus('success');
    setSystemFeedback(`Task ${currentStage.stageNumber} hoàn thành. Điểm: ${score}/100`);

    await requestRoleplayFeedback({
      eventType: 'success_attempt',
      playerAction: solution,
      attemptNumber: nextAttempts,
      fallbackComplete: true,
    });
  }

  async function handleTimeExpired() {
    if (missionStatus !== 'playing') {
      return;
    }

    setMissionStatus('failed');
    setSystemFeedback('Hết thời gian. Nhân vật đang phản hồi về cách xử lý hiện tại.');

    await requestRoleplayFeedback({
      eventType: 'wrong_attempt',
      playerAction: workspaceBlocks.map((block) => block.type),
      attemptNumber: attemptsUsed + 1,
      fallbackComplete: false,
    });
  }

  async function requestRoleplayFeedback({
    eventType,
    playerAction,
    attemptNumber,
    fallbackComplete,
  }: {
    eventType: 'wrong_attempt' | 'success_attempt';
    playerAction: BlockType[];
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
        playerAction,
        attemptNumber,
        timeTaken: currentStage.timeLimit - timeLeft,
      });

      setInteractionId(reply.interactionId || interactionId);
      setRoleplayOverlay({
        ...reply,
        stageComplete: fallbackComplete ? true : reply.stageComplete,
      });

      setRoleplayTurns((current) => [
        ...current,
        {
          stageId: currentStage.id,
          stageNumber: currentStage.stageNumber,
          actorId: reply.actorId,
          actorName: reply.actorName,
          actorRole: reply.actorRole,
          aiMessage: reply.message,
          playerResponse: `BLOCKS: ${playerAction.join(' → ') || '(trống)'}`,
          eventType,
          timeTaken: currentStage.timeLimit - timeLeft,
          observation: reply.observation,
        },
      ]);
    } finally {
      setIsRoleplayLoading(false);
    }
  }

  function retryStage() {
    recordBehavior('retry_stage', [], 0);
    setWorkspaceBlocks([]);
    setCodeText(currentStage.codeStarter || '');
    setCodeOutput('');
    setAttemptsUsed(0);
    setTimeLeft(currentStage.timeLimit);
    setMissionStatus('playing');
    setRoleplayOverlay(null);
    setStageResult(null);
    setSystemFeedback('Hãy thử lại Task này với cách suy nghĩ mới.');
    timeoutTriggeredRef.current = false;
  }

  function closeMistakeFeedback() {
    setRoleplayOverlay(null);
  }

  function continueAfterSuccess() {
    if (!stageResult) {
      return;
    }

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
    const totalAttempts = results.reduce(
      (total, result) => total + result.attemptsUsed,
      0,
    );
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
                <p className="text-[10px] tracking-[0.25em] text-[#8be9fd] sm:text-xs">
                  TASK {currentStage.stageNumber} · {stageIntro?.actorName}
                </p>
                <h1 className="mt-2 text-xl font-black text-[#ffe066] sm:text-3xl">
                  {currentStage.title}
                </h1>
              </div>
              <span className="w-fit border-2 border-[#ffe066] bg-[#7c3aed] px-3 py-2 text-xs font-black">
                {currentStage.stageNumber === 1 ? 'TRAINING' : currentStage.stageNumber === 2 ? 'FRESHER' : 'JUNIOR'}
              </span>
            </div>
          </div>

          <div className="grid gap-5 p-3 sm:p-5 lg:grid-cols-[300px_minmax(0,1fr)]">
            <aside className="space-y-4">
              <MissionDescription
                objective={currentStage.objective}
                explanation={currentStage.explanation}
                testCase={currentStage.testCase}
                expectedOutput={currentStage.expectedOutput}
              />
              {currentStage.mode === 'code' ? (
                <CodeTrainingGuide
                  hint={currentStage.codeHint || ''}
                  starter={currentStage.codeStarter || ''}
                />
              ) : (
                <BlockPalette
                  availableBlocks={currentStage.availableBlocks}
                  onDragStart={handleDragStart}
                  onAddBlock={addBlock}
                />
              )}
            </aside>

            <div className="min-w-0 space-y-4">
              {currentStage.mode === 'code' ? (
                <CodeEditor
                  value={codeText}
                  output={codeOutput}
                  disabled={missionStatus !== 'playing' || isRoleplayLoading}
                  onChange={setCodeText}
                  onRun={() => void handleCodeRun()}
                />
              ) : (
                <Workspace
                  blocks={workspaceBlocks}
                  onDrop={handleDrop}
                  onRemove={removeBlock}
                  onMove={moveBlock}
                />
              )}

              <div className="border-4 border-[#4d568c] bg-[#181d3a] p-4">
                <p className="text-[10px] tracking-[0.25em] text-[#8be9fd] sm:text-xs">
                  SYSTEM FEEDBACK
                </p>
                <p className="mt-2 text-sm font-bold leading-6 sm:text-base">
                  {isRoleplayLoading ? 'Nhân vật đang soi hành động của cậu...' : systemFeedback}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={onBack}
                  className="border-4 border-[#7c83a8] bg-[#282d50] px-4 py-3 font-black"
                >
                  ◀ QUAY LẠI
                </button>
                <button
                  type="button"
                  disabled={missionStatus !== 'playing' || isRoleplayLoading}
                  onClick={currentStage.mode === 'code' ? () => { setCodeText(currentStage.codeStarter || ''); setCodeOutput(''); } : resetWorkspace}
                  className="border-4 border-[#ffb84d] bg-[#5b3718] px-4 py-3 font-black disabled:opacity-40"
                >
                  ↻ {currentStage.mode === 'code' ? 'ĐẶT LẠI CODE' : 'RESET'}
                </button>
                <motion.button
                  type="button"
                  disabled={missionStatus !== 'playing' || isRoleplayLoading}
                  onClick={() => void (currentStage.mode === 'code' ? handleCodeRun() : handleRun())}
                  whileHover={missionStatus === 'playing' ? { y: -4 } : undefined}
                  className="border-4 border-[#ffe066] bg-[#7c3aed] px-4 py-3 font-black shadow-[5px_5px_0_#000] disabled:opacity-40"
                >
                  ▶ {currentStage.mode === 'code' ? 'CHẠY THỬ' : 'CHẠY CHƯƠNG TRÌNH'}
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
          onTryAgain={closeMistakeFeedback}
          onRetryStage={retryStage}
          onContinue={continueAfterSuccess}
        />
      )}

      <CrtOverlay />
    </main>
  );
}

function TopHud({
  playerName,
  currentStage,
  timeLeft,
  attemptsUsed,
  maxAttempts,
}: {
  playerName: string;
  currentStage: number;
  timeLeft: number;
  attemptsUsed: number;
  maxAttempts: number;
}) {
  return (
    <header className="border-4 border-[#4d568c] bg-[#181d3a] p-3 shadow-[5px_5px_0_#070a17] sm:p-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-[10px] tracking-[0.25em] text-[#8be9fd] sm:text-xs">
            PIXEL TECH CORP · AI ROLEPLAY
          </p>
          <h1 className="mt-2 text-xl font-black text-[#ffe066] sm:text-3xl">
            LOGIC QUEST
          </h1>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <HudBox label="PLAYER" value={playerName} />
          <HudBox label="TASK" value={`${currentStage} / 3`} />
          <HudBox label="TIME" value={formatTime(timeLeft)} />
          <HudBox label="ATTEMPTS" value={`${attemptsUsed} / ${maxAttempts}`} />
        </div>
      </div>
    </header>
  );
}

function HudBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 border-2 border-[#4d568c] bg-[#0f1430] px-2 py-2 text-center">
      <p className="text-[8px] tracking-wider text-[#8be9fd]">{label}</p>
      <p className="mt-1 truncate text-xs font-black text-[#ffe066] sm:text-sm">{value}</p>
    </div>
  );
}

function CampaignProgress({ currentStageIndex }: { currentStageIndex: number }) {
  return (
    <div className="mt-4 grid grid-cols-3 gap-2 sm:mt-6 sm:gap-3">
      {campaignStages.map((stage, index) => (
        <div
          key={stage.id}
          className={[
            'border-2 p-2 text-center sm:border-4 sm:p-3',
            index === currentStageIndex
              ? 'border-[#ffe066] bg-[#7c3aed]'
              : index < currentStageIndex
                ? 'border-[#63e6a8] bg-[#16382d]'
                : 'border-[#4d568c] bg-[#181d3a]',
          ].join(' ')}
        >
          <p className="text-[9px] tracking-wider sm:text-xs">TASK {stage.stageNumber}</p>
          <p className="mt-1 text-[10px] font-black sm:text-sm">
            {index < currentStageIndex ? '✓ DONE' : stage.difficulty}
          </p>
        </div>
      ))}
    </div>
  );
}

function MissionDescription({
  objective,
  explanation,
  testCase,
  expectedOutput,
}: {
  objective: string;
  explanation: string;
  testCase: string;
  expectedOutput: string;
}) {
  return (
    <div className="border-4 border-[#7c3aed] bg-[#211944] p-4">
      <p className="text-[10px] tracking-[0.25em] text-[#8be9fd] sm:text-xs">MISSION</p>
      <p className="mt-3 text-sm leading-6 text-[#e4e6ff] sm:text-base sm:leading-7">{objective}</p>
      <p className="mt-3 border-l-4 border-[#7c83a8] pl-3 text-xs leading-6 text-[#aeb4dc] sm:text-sm">
        {explanation}
      </p>
      <div className="mt-4 border-l-4 border-[#ffe066] bg-[#181d3a] p-3">
        <p className="text-xs text-[#8be9fd] sm:text-sm">{testCase}</p>
        <p className="mt-2 font-black text-[#63e6a8]">{expectedOutput}</p>
      </div>
    </div>
  );
}

function CodeTrainingGuide({ hint, starter }: { hint: string; starter: string }) {
  return (
    <div className="border-4 border-[#63e6a8] bg-[#16382d] p-4">
      <p className="text-[10px] tracking-[0.25em] text-[#8be9fd] sm:text-xs">HỌC VIỆC · BƯỚC 1</p>
      <p className="mt-3 text-sm font-black leading-6 text-white">Làm mẫu trước, rồi mới làm task khó hơn.</p>
      <ol className="mt-3 space-y-2 text-xs leading-5 text-[#d9ffe9] sm:text-sm">
        <li>1. Nhìn đoạn code mẫu bên dưới.</li>
        <li>2. Gõ lại vào ô code.</li>
        <li>3. Bấm <b>CHẠY THỬ</b> để xem kết quả.</li>
      </ol>
      <pre className="mt-4 overflow-x-auto rounded-xl bg-[#08140f] p-3 text-xs text-[#63e6a8]">{starter}</pre>
      <p className="mt-3 text-xs font-bold text-[#ffe066]">{hint}</p>
    </div>
  );
}

function CodeEditor({ value, output, disabled, onChange, onRun }: {
  value: string; output: string; disabled: boolean; onChange: (value: string) => void; onRun: () => void;
}) {
  return (
    <div className="border-4 border-[#4d568c] bg-[#0c1025] p-3 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] tracking-[0.25em] text-[#8be9fd] sm:text-xs">CODE EDITOR</p>
          <h2 className="mt-2 text-lg font-black text-[#ffe066]">Gõ code và chạy thử</h2>
        </div>
        <span className="rounded-full bg-[#63e6a8]/15 px-3 py-1 text-[10px] font-black text-[#63e6a8]">PYTHON CƠ BẢN</span>
      </div>
      <textarea
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        spellCheck={false}
        className="mt-4 min-h-[220px] w-full resize-y rounded-2xl border-2 border-[#4d568c] bg-[#050817] p-4 font-mono text-sm leading-7 text-[#d9ffe9] outline-none focus:border-[#ffe066] disabled:opacity-60"
        aria-label="Ô nhập code"
      />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button type="button" onClick={onRun} disabled={disabled} className="rounded-xl border-2 border-[#ffe066] bg-[#7c3aed] px-5 py-3 text-sm font-black text-white disabled:opacity-40">▶ CHẠY THỬ</button>
        <span className="text-xs font-bold text-[#9fa8d8]">Bạn có thể sửa code rồi chạy lại bất cứ lúc nào.</span>
      </div>
      {output && <div className="mt-4 rounded-xl border-2 border-[#63e6a8]/40 bg-[#10271e] p-3 font-mono text-sm font-bold text-[#63e6a8]">{output}</div>}
    </div>
  );
}

function BlockPalette({
  availableBlocks,
  onDragStart,
  onAddBlock,
}: {
  availableBlocks: BlockType[];
  onDragStart: (event: DragEvent<HTMLDivElement>, blockType: BlockType) => void;
  onAddBlock: (blockType: BlockType) => void;
}) {
  return (
    <div className="border-4 border-[#4d568c] bg-[#181d3a] p-4">
      <p className="text-[10px] tracking-[0.25em] text-[#8be9fd] sm:text-xs">
        BLOCK PALETTE · KÉO HOẶC CHẠM
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-1">
        {availableBlocks.map((blockType) => {
          const info = blockInfo[blockType];
          return (
            <div
              key={blockType}
              draggable
              role="button"
              tabIndex={0}
              onDragStart={(event) => onDragStart(event, blockType)}
              onClick={() => onAddBlock(blockType)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onAddBlock(blockType);
                }
              }}
              className="cursor-pointer border-4 border-[#070a17] bg-[#282d50] p-3 shadow-[4px_4px_0_#070a17] hover:-translate-y-1"
              style={{ borderLeftColor: info.color }}
            >
              <p className="text-sm font-black sm:text-base">{info.icon} {info.title}</p>
              <p className="mt-1 text-[10px] leading-5 text-[#aeb4dc] sm:text-xs">{info.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Workspace({
  blocks,
  onDrop,
  onRemove,
  onMove,
}: {
  blocks: WorkspaceBlock[];
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
  onRemove: (blockId: string) => void;
  onMove: (index: number, direction: 'up' | 'down') => void;
}) {
  return (
    <div
      onDragOver={(event) => event.preventDefault()}
      onDrop={onDrop}
      className="min-h-[330px] border-4 border-dashed border-[#4d568c] bg-[#0c1025] p-3 sm:min-h-[420px] sm:p-5"
    >
      <p className="text-[10px] tracking-[0.25em] text-[#8be9fd] sm:text-xs">WORKSPACE</p>
      <h2 className="mt-2 text-lg font-black text-[#ffe066] sm:text-xl">CHƯƠNG TRÌNH CỦA BẠN</h2>

      {blocks.length === 0 ? (
        <div className="flex min-h-[250px] items-center justify-center text-center">
          <div>
            <p className="text-5xl">📦</p>
            <p className="mt-4 font-black text-[#8be9fd]">THÊM BLOCK VÀO ĐÂY</p>
            <p className="mt-2 text-xs leading-6 text-[#7c83a8] sm:text-sm">
              Desktop: kéo thả · Mobile/Tablet: chạm để thêm
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {blocks.map((block, index) => {
            const info = blockInfo[block.type];
            return (
              <motion.div
                key={block.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 border-2 border-[#4d568c] bg-[#181d3a] p-2 sm:gap-3 sm:border-4 sm:p-3"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center border-2 border-[#070a17] bg-[#282d50] text-xs font-black">
                  {index + 1}
                </span>
                <p className="min-w-0 flex-1 truncate text-sm font-black text-[#ffe066] sm:text-base">
                  {info.icon} {info.title}
                </p>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => onMove(index, 'up')}
                    className="min-h-9 min-w-9 border-2 border-[#4d568c] bg-[#282d50] disabled:opacity-30"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    disabled={index === blocks.length - 1}
                    onClick={() => onMove(index, 'down')}
                    className="min-h-9 min-w-9 border-2 border-[#4d568c] bg-[#282d50] disabled:opacity-30"
                  >
                    ▼
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(block.id)}
                    className="min-h-9 min-w-9 border-2 border-[#ff5c7a] bg-[#38162b] text-[#ff9aaa]"
                  >
                    ✕
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function RoleplayFeedbackOverlay({
  reply,
  isLoading,
  status,
  isFinalStage,
  onTryAgain,
  onRetryStage,
  onContinue,
}: {
  reply: RoleplayReply | null;
  isLoading: boolean;
  status: MissionStatus;
  isFinalStage: boolean;
  onTryAgain: () => void;
  onRetryStage: () => void;
  onContinue: () => void;
}) {
  const actor = reply ? getRoleplayActor(reply.actorId) : null;
  const accent = actor?.accent ?? '#ffe066';

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#050711]/90 p-3 backdrop-blur-sm sm:p-6">
      <div className="flex min-h-full items-center justify-center py-4">
        <motion.section
          initial={{ opacity: 0, scale: 0.92, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full max-w-5xl overflow-hidden border-4 bg-[#11162f] shadow-[8px_8px_0_#000]"
          style={{ borderColor: accent }}
        >
          <div className="border-b-4 border-[#4d568c] bg-[#181d3a] p-4 sm:p-5">
            <p className="text-[10px] tracking-[0.3em] text-[#8be9fd] sm:text-xs">
              LIVE ROLEPLAY RESPONSE
            </p>
            <h2 className="mt-2 text-xl font-black text-[#ffe066] sm:text-3xl">
              {isLoading ? 'ĐANG PHẢN ỨNG...' : reply?.actorName}
            </h2>
          </div>

          <div className="grid gap-5 p-4 sm:p-6 md:grid-cols-[240px_minmax(0,1fr)]">
            <div
              className="flex min-h-[260px] flex-col justify-center border-4 p-4 text-center"
              style={{ borderColor: accent, backgroundColor: actor?.softAccent ?? '#211944' }}
            >
              {actor ? (
                <CharacterPortrait
                  actor={actor}
                  size="large"
                  mood={status === 'success' ? 'happy' : status === 'failed' ? 'angry' : 'warning'}
                  isThinking={isLoading}
                />
              ) : (
                <p className="text-7xl">🤖</p>
              )}
            </div>

            <div>
              {isLoading ? (
                <div className="border-l-4 border-[#8be9fd] bg-[#181d3a] p-5 text-sm leading-7 text-[#c4c8e8] sm:text-base">
                  Nhân vật đang nhìn lại thứ tự cậu vừa kéo. Sai là bị nhắc ngay, đúng thì đi tiếp.
                </div>
              ) : (
                <>
                  <div
                    className="border-l-4 bg-[#181d3a] p-4 sm:p-5"
                    style={{ borderLeftColor: accent }}
                  >
                    <p className="text-[10px] tracking-[0.25em] text-[#8be9fd] sm:text-xs">PHẢN HỒI THEO VAI</p>
                    <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#f1f2ff] sm:text-base sm:leading-8">{reply?.message}</p>
                  </div>

                  {reply?.hint && (
                    <div className="mt-4 border-l-4 border-[#ffe066] bg-[#292315] p-4">
                      <p className="text-[10px] tracking-[0.25em] text-[#ffe066] sm:text-xs">GỢI Ý TỪ NHÂN VẬT</p>
                      <p className="mt-3 text-sm leading-7 text-[#fff7cf] sm:text-base">{reply.hint}</p>
                    </div>
                  )}

                  {reply?.observation && (
                    <div className="mt-4 border-l-4 border-[#63e6a8] bg-[#112a27] p-4">
                      <p className="text-[10px] tracking-[0.25em] text-[#63e6a8] sm:text-xs">HỆ THỐNG GHI NHẬN</p>
                      <p className="mt-3 text-sm leading-7 text-[#d6ffec] sm:text-base">{reply.observation}</p>
                    </div>
                  )}
                </>
              )}

              {!isLoading && (
                <div className="mt-6">
                  {status === 'playing' && (
                    <button
                      type="button"
                      onClick={onTryAgain}
                      className="pixel-button w-full px-6 py-4"
                    >
                      THỬ LẠI THEO GỢI Ý ▶
                    </button>
                  )}
                  {status === 'failed' && (
                    <button
                      type="button"
                      onClick={onRetryStage}
                      className="pixel-button w-full px-6 py-4"
                    >
                      ↻ LÀM LẠI TASK
                    </button>
                  )}
                  {status === 'success' && (
                    <button
                      type="button"
                      onClick={onContinue}
                      className="pixel-button w-full px-6 py-4"
                    >
                      {isFinalStage ? 'SANG ROLEPLAY STAGE 4 ▶' : 'GẶP NHÂN VẬT TIẾP THEO ▶'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}

function compareSolutions(current: BlockType[], expected: BlockType[]) {
  return current.length === expected.length && current.every((item, index) => item === expected[index]);
}

function getFailureFeedback(current: BlockType[], expected: BlockType[]) {
  if (current.length < expected.length) {
    return 'Chương trình đang thiếu block.';
  }

  if (current.length > expected.length) {
    return 'Chương trình đang có thừa block.';
  }

  return 'Số lượng block đã đúng nhưng thứ tự xử lý chưa hợp lý.';
}

function calculateStageScore(attempts: number, timeTaken: number, timeLimit: number) {
  const attemptPenalty = Math.max(0, attempts - 1) * 10;
  const timeRatio = timeTaken / timeLimit;
  const timePenalty = timeRatio > 0.8 ? 15 : timeRatio > 0.6 ? 8 : 0;
  return Math.max(40, 100 - attemptPenalty - timePenalty);
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
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
