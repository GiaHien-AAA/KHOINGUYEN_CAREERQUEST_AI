import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

import { CharacterPortrait, getCharacterSpritePath } from '../components/CharacterPortrait';
import type { PlayerProfile } from './PlayerProfilePage';
import {
  getCareerById,
  type CareerId,
} from '../game/careerCatalog';
import {
  getIndustryGame,
  type AllocationTask,
  type IndustryRoleplayStage,
  type IndustryTask,
  type LayoutTask,
  type PriorityTask,
  type RiskCheckTask,
  type SortingTask,
} from '../game/industryGameData';
import { roleplayActors, type RoleplayActorId } from '../game/roleplayScenarioData';
import type {
  CareerAnalysis,
  HybridMissionResult,
  OpenAnswer,
  RoleplayTurn,
} from '../game/hybridMissionTypes';
import {
  getRoleplayIntro,
  sendRoleplayTurn,
  type RoleplayScenarioOverride,
  type RoleplayTone,
} from '../services/roleplayService';

interface IndustryMiniGamePageProps {
  careerId: CareerId;
  playerProfile: PlayerProfile;
  onBack: () => void;
  onComplete: (result: HybridMissionResult) => void;
}

interface DialogueMessage {
  id: string;
  speaker: 'actor' | 'player' | 'system';
  text: string;
  tone?: RoleplayTone;
}

interface TaskResult {
  score: number;
  summary: string;
  feedback: string;
  tone: RoleplayTone;
}

type AllocationValues = Record<string, number>;
type AssignmentValues = Record<string, string>;
type StagePhase = 'briefing' | 'task' | 'chat';

export function IndustryMiniGamePage({
  careerId,
  playerProfile,
  onBack,
  onComplete,
}: IndustryMiniGamePageProps) {
  const career = getCareerById(careerId) ?? getCareerById('business')!;
  const game = getIndustryGame(careerId) ?? getIndustryGame('business')!;
  const [stageIndex, setStageIndex] = useState(0);
  const [phase, setPhase] = useState<StagePhase>('briefing');
  const [conversation, setConversation] = useState<DialogueMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [stagePlayerMessages, setStagePlayerMessages] = useState<string[]>([]);
  const [answers, setAnswers] = useState<OpenAnswer[]>([]);
  const [turns, setTurns] = useState<RoleplayTurn[]>([]);
  const [scores, setScores] = useState<number[]>([]);
  const [interactionId, setInteractionId] = useState('');
  const [turnNumber, setTurnNumber] = useState(1);
  const [activeTone, setActiveTone] = useState<RoleplayTone>('serious');
  const [isLoadingIntro, setIsLoadingIntro] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [stageCompleted, setStageCompleted] = useState(false);
  const [taskSubmitted, setTaskSubmitted] = useState(false);
  const [taskResult, setTaskResult] = useState<TaskResult | null>(null);
  const [validationMessage, setValidationMessage] = useState('');
  const [taskValidationMessage, setTaskValidationMessage] = useState('');

  const [allocationValues, setAllocationValues] = useState<AllocationValues>({});
  const [sortingValues, setSortingValues] = useState<AssignmentValues>({});
  const [priorityItems, setPriorityItems] = useState<string[]>([]);
  const [layoutValues, setLayoutValues] = useState<AssignmentValues>({});
  const [riskChoices, setRiskChoices] = useState<string[]>([]);

  const totalStartedAtRef = useRef(Date.now());
  const stageStartedAtRef = useRef(Date.now());

  const stage = game.stages[stageIndex] || game.stages[0];
  const actor = roleplayActors[stage.actorId] ?? roleplayActors['mentor-nova'];


  useEffect(() => {
    if (!stage) return;

    let cancelled = false;
    setPhase('briefing');
    setIsLoadingIntro(true);
    setConversation([]);
    setDraft('');
    setStagePlayerMessages([]);
    setInteractionId('');
    setTurnNumber(1);
    setStageCompleted(false);
    setTaskSubmitted(false);
    setTaskResult(null);
    setValidationMessage('');
    setTaskValidationMessage('');
    setActiveTone('serious');
    resetTaskState(stage.task);
    stageStartedAtRef.current = Date.now();

    getRoleplayIntro(stage.stageId, playerProfile, buildScenarioOverride(stage))
      .then((intro) => {
        if (cancelled) return;
        setInteractionId(intro.interactionId);
        setActiveTone(intro.tone);
        setConversation([
          {
            id: `${stage.stageId}-intro`,
            speaker: 'actor',
            text: intro.message,
            tone: intro.tone,
          },
        ]);
      })
      .catch(() => {
        if (cancelled) return;
        setConversation([
          {
            id: `${stage.stageId}-local-intro`,
            speaker: 'actor',
            text: stage.context,
            tone: 'serious',
          },
        ]);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingIntro(false);
      });

    return () => {
      cancelled = true;
    };
  }, [stage, playerProfile]);

  function resetTaskState(task: IndustryTask) {
    if (task.type === 'allocation') {
      const initial: AllocationValues = {};
      const base = Math.floor(task.total / task.items.length);
      task.items.forEach((item, index) => {
        initial[item.id] = index === task.items.length - 1
          ? task.total - base * (task.items.length - 1)
          : base;
      });
      setAllocationValues(initial);
    } else {
      setAllocationValues({});
    }

    if (task.type === 'sorting') {
      const initial: AssignmentValues = {};
      task.cards.forEach((card) => {
        initial[card.id] = '';
      });
      setSortingValues(initial);
    } else {
      setSortingValues({});
    }

    if (task.type === 'priority') {
      setPriorityItems(task.items.map((item) => item.id));
    } else {
      setPriorityItems([]);
    }

    if (task.type === 'layout') {
      const initial: AssignmentValues = {};
      task.zones.forEach((zone) => {
        initial[zone.id] = '';
      });
      setLayoutValues(initial);
    } else {
      setLayoutValues({});
    }

    setRiskChoices([]);
  }

  if (!career || !game || !stage) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0b1024] px-4 text-white">
        <section className="w-full max-w-xl rounded-3xl border border-[#ff5c7a]/40 bg-[#11162f] p-6 text-center shadow-2xl">
          <h1 className="text-2xl font-black text-[#ffd6de]">Ngành này chưa có career campaign</h1>
          <button type="button" onClick={onBack} className="mt-6 rounded-2xl bg-[#7c3aed] px-5 py-3 font-black">
            Quay lại
          </button>
        </section>
      </main>
    );
  }

  function submitTask() {
    if (!stage || taskSubmitted) return;
    const result = evaluateTask(stage.task);
    if (!result) return;

    setTaskResult(result);
    setTaskSubmitted(true);
    setActiveTone(result.tone);
    setPhase('chat');
    setConversation((current) => [
      ...current,
      {
        id: `${stage.stageId}-actor-task-feedback-${Date.now()}`,
        speaker: 'actor',
        text: `${result.feedback}\n${stage.playerGoal}`,
        tone: result.tone,
      },
    ]);
  }

  function evaluateTask(task: IndustryTask): TaskResult | null {
    setTaskValidationMessage('');

    if (task.type === 'allocation') return evaluateAllocationTask(task);
    if (task.type === 'sorting') return evaluateSortingTask(task);
    if (task.type === 'priority') return evaluatePriorityTask(task);
    if (task.type === 'layout') return evaluateLayoutTask(task);
    if (task.type === 'risk-check') return evaluateRiskCheckTask(task);

    return null;
  }

  function evaluateAllocationTask(task: AllocationTask): TaskResult | null {
    const total = task.items.reduce((sum, item) => sum + Number(allocationValues[item.id] || 0), 0);
    if (total !== task.total) {
      setTaskValidationMessage(`Tổng hiện tại là ${total}/${task.total}. Cần chia đúng ${task.total} ${task.unitLabel}.`);
      return null;
    }

    let score = 0;
    const goodItems: string[] = [];
    const weakItems: string[] = [];

    task.items.forEach((item) => {
      const value = Number(allocationValues[item.id] || 0);
      const distance = value < item.idealMin
        ? item.idealMin - value
        : value > item.idealMax
          ? value - item.idealMax
          : 0;
      const itemScore = Math.max(35, 100 - distance * 5);
      score += itemScore;
      if (distance === 0) goodItems.push(item.label);
      if (distance >= 8) weakItems.push(item.label);
    });

    const finalScore = Math.round(score / task.items.length);
    return {
      score: finalScore,
      tone: finalScore >= 78 ? 'happy' : finalScore >= 60 ? 'serious' : 'warning',
      feedback: finalScore >= 78 ? task.successText : task.warningText,
      summary: `Bạn chia ${task.unitLabel}: ${task.items.map((item) => `${item.label} ${allocationValues[item.id] || 0}`).join(', ')}. ${goodItems.length ? `Điểm ổn: ${goodItems.join(', ')}.` : ''} ${weakItems.length ? `Điểm cần bảo vệ: ${weakItems.join(', ')}.` : ''}`,
    };
  }

  function evaluateSortingTask(task: SortingTask): TaskResult | null {
    const missing = task.cards.filter((card) => !sortingValues[card.id]);
    if (missing.length > 0) {
      setTaskValidationMessage('Cần phân loại hết các thẻ trước khi tiếp tục.');
      return null;
    }

    const correctCards = task.cards.filter((card) => sortingValues[card.id] === card.correctGroupId);
    const finalScore = Math.round((correctCards.length / task.cards.length) * 100);
    const missed = task.cards.filter((card) => sortingValues[card.id] !== card.correctGroupId).map((card) => card.label);

    return {
      score: finalScore,
      tone: finalScore >= 80 ? 'happy' : finalScore >= 60 ? 'serious' : 'warning',
      feedback: finalScore >= 80 ? task.successText : task.warningText,
      summary: `Bạn phân loại đúng ${correctCards.length}/${task.cards.length} thẻ. ${missed.length ? `Các thẻ cần xem lại: ${missed.join(', ')}.` : 'Các thẻ chính đã được đặt đúng nhóm.'}`,
    };
  }

  function evaluatePriorityTask(task: PriorityTask): TaskResult | null {
    if (priorityItems.length !== task.items.length) {
      setTaskValidationMessage('Danh sách ưu tiên chưa đủ dữ liệu.');
      return null;
    }

    let penalty = 0;
    const orderLabels = priorityItems.map((itemId, index) => {
      const item = task.items.find((candidate) => candidate.id === itemId);
      if (!item) return '';
      penalty += Math.abs(index + 1 - item.idealRank) * 8;
      return `${index + 1}. ${item.label}`;
    }).filter(Boolean);

    const finalScore = Math.max(35, Math.min(100, Math.round(100 - penalty)));
    return {
      score: finalScore,
      tone: finalScore >= 80 ? 'happy' : finalScore >= 60 ? 'serious' : 'warning',
      feedback: finalScore >= 80 ? task.successText : task.warningText,
      summary: `Thứ tự bạn chọn: ${orderLabels.join(' → ')}.`,
    };
  }

  function evaluateLayoutTask(task: LayoutTask): TaskResult | null {
    const missing = task.zones.filter((zone) => !layoutValues[zone.id]);
    if (missing.length > 0) {
      setTaskValidationMessage('Cần đặt phòng cho tất cả vùng trước khi tiếp tục.');
      return null;
    }

    const selectedRooms = Object.values(layoutValues).filter(Boolean);
    const duplicatedRoom = selectedRooms.find((roomId, index) => selectedRooms.indexOf(roomId) !== index);
    if (duplicatedRoom) {
      setTaskValidationMessage('Mỗi phòng chỉ nên đặt vào một vùng. Hãy chỉnh lại các vùng bị trùng.');
      return null;
    }

    let score = 0;
    const weakZones: string[] = [];
    task.zones.forEach((zone) => {
      const roomId = layoutValues[zone.id];
      if (zone.idealRoomId && roomId === zone.idealRoomId) {
        score += 100;
      } else if (zone.acceptedRoomIds.includes(roomId)) {
        score += 80;
      } else {
        score += 35;
        weakZones.push(zone.label);
      }
    });

    const finalScore = Math.round(score / task.zones.length);
    const placements = task.zones.map((zone) => {
      const room = task.rooms.find((item) => item.id === layoutValues[zone.id]);
      return `${zone.label}: ${room?.label || 'chưa đặt'}`;
    });

    return {
      score: finalScore,
      tone: finalScore >= 80 ? 'happy' : finalScore >= 60 ? 'serious' : 'warning',
      feedback: finalScore >= 80 ? task.successText : task.warningText,
      summary: `Bố trí: ${placements.join(', ')}. ${weakZones.length ? `Vùng cần bảo vệ thêm: ${weakZones.join(', ')}.` : 'Các vùng chính tương đối hợp lý.'}`,
    };
  }

  function evaluateRiskCheckTask(task: RiskCheckTask): TaskResult | null {
    if (riskChoices.length === 0) {
      setTaskValidationMessage('Hãy chọn ít nhất một tín hiệu/câu hỏi trước khi tiếp tục.');
      return null;
    }

    if (riskChoices.length > task.maxChoices) {
      setTaskValidationMessage(`Chỉ được chọn tối đa ${task.maxChoices} mục.`);
      return null;
    }

    const requiredChoices = task.choices.filter((choice) => choice.required);
    const requiredHit = requiredChoices.filter((choice) => riskChoices.includes(choice.id)).length;
    const wrongHit = task.choices.filter((choice) => !choice.required && riskChoices.includes(choice.id)).length;
    const redFlagHit = task.choices.filter((choice) => choice.redFlag && riskChoices.includes(choice.id)).length;

    let finalScore = Math.round((requiredHit / Math.max(1, requiredChoices.length)) * 100);
    finalScore -= wrongHit * 10;
    finalScore += redFlagHit * 8;
    finalScore = Math.max(35, Math.min(100, finalScore));

    const selectedLabels = task.choices
      .filter((choice) => riskChoices.includes(choice.id))
      .map((choice) => choice.label);

    const missingLabels = requiredChoices
      .filter((choice) => !riskChoices.includes(choice.id))
      .map((choice) => choice.label);

    return {
      score: finalScore,
      tone: finalScore >= 80 ? 'happy' : finalScore >= 60 ? 'serious' : 'warning',
      feedback: finalScore >= 80 ? task.successText : task.warningText,
      summary: `Bạn chọn: ${selectedLabels.join(', ')}. ${missingLabels.length ? `Còn thiếu: ${missingLabels.join(', ')}.` : 'Các tín hiệu quan trọng đã được chọn.'}`,
    };
  }

  async function submitAnswer() {
    if (!stage || isSending || stageCompleted || !taskSubmitted) return;

    const answerText = draft.trim();
    if (answerText.length < stage.minLength) {
      setValidationMessage(`Viết cụ thể hơn một chút. Tối thiểu khoảng ${stage.minLength} ký tự để nhân vật có dữ liệu phản hồi.`);
      return;
    }

    setValidationMessage('');
    setIsSending(true);
    setDraft('');

    const evidenceForAI = taskResult ? `\n\nDữ kiện nhiệm vụ vừa làm để nhân vật hiểu bối cảnh: điểm ${taskResult.score}/100. ${taskResult.summary}` : '';
    const messageForAI = `${answerText}${evidenceForAI}`;
    const nextStageMessages = [...stagePlayerMessages, answerText];
    const elapsed = Math.max(4, Math.round((Date.now() - stageStartedAtRef.current) / 1000));
    const eventType = turnNumber <= 1 ? 'player_response' : 'follow_up_response';

    setConversation((current) => [
      ...current,
      {
        id: `${stage.stageId}-player-${turnNumber}-${Date.now()}`,
        speaker: 'player',
        text: answerText,
      },
    ]);

    try {
      const reply = await sendRoleplayTurn({
        stageId: stage.stageId,
        playerProfile,
        previousInteractionId: interactionId,
        eventType,
        playerMessage: messageForAI,
        turnNumber,
        timeTaken: elapsed,
        scenarioOverride: buildScenarioOverride(stage),
      });

      const combinedActorMessage = reply.followUpQuestion
        ? `${reply.message}\n\n${reply.followUpQuestion}`
        : reply.message;

      const nextTurn: RoleplayTurn = {
        stageId: stage.stageId,
        stageNumber: stage.stageNumber,
        actorId: reply.actorId,
        actorName: reply.actorName,
        actorRole: reply.actorRole,
        aiMessage: combinedActorMessage,
        playerResponse: answerText,
        eventType,
        timeTaken: elapsed,
        observation: reply.observation,
      };

      setInteractionId(reply.interactionId);
      setActiveTone(reply.tone);
      setStagePlayerMessages(nextStageMessages);
      setTurns((current) => [...current, nextTurn]);
      setConversation((current) => [
        ...current,
        {
          id: `${stage.stageId}-actor-${turnNumber}-${Date.now()}`,
          speaker: 'actor',
          text: combinedActorMessage,
          tone: reply.tone,
        },
      ]);

      const mustComplete = reply.stageComplete || !reply.shouldContinue || turnNumber >= 4;
      if (mustComplete) {
        const roleplayScore = scoreIndustryAnswer(stage, `${nextStageMessages.join(' ')} ${taskResult?.summary || ''}`);
        const stageScore = Math.round(roleplayScore * 0.45 + (taskResult?.score || 60) * 0.55);
        const nextAnswer: OpenAnswer = {
          stageId: stage.stageId,
          question: `${stage.task.title} · ${stage.playerGoal}`,
          answer: `${taskResult ? `[Mini game] ${taskResult.summary}\n` : ''}${nextStageMessages.join('\n')}`,
          timeTaken: elapsed,
        };
        setAnswers((current) => [...current, nextAnswer]);
        setScores((current) => [...current, stageScore]);
        setStageCompleted(true);
      } else {
        setTurnNumber((current) => current + 1);
      }
    } catch {
      setValidationMessage('Nhân vật chưa phản hồi được. Thử gửi lại câu trả lời một lần nữa.');
    } finally {
      setIsSending(false);
    }
  }

  function continueNext() {
    if (!stageCompleted) return;

    if (stageIndex < game.stages.length - 1) {
      setStageIndex((current) => current + 1);
      return;
    }

    const finalScore = scores.length > 0
      ? Math.round(scores.reduce((total, score) => total + score, 0) / scores.length)
      : 60;

    onComplete({
      pass: true,
      attemptsUsed: game.stages.length,
      timeTaken: Math.max(10, Math.round((Date.now() - totalStartedAtRef.current) / 1000)),
      score: finalScore,
      analysis: buildIndustryAnalysis(careerId, finalScore, answers, turns, game.stages),
      openAnswers: answers,
      roleplayTurns: turns,
      behaviorEvents: [],
    });
  }

  const actorMessage = conversation.find((message) => message.speaker === 'actor')?.text || stage.context;
  const chatMessages = conversation.filter((message) => message.speaker !== 'system').slice(-5);
  const progressPercent = Math.round(((stageIndex + (phase === 'briefing' ? 0 : phase === 'task' ? 0.35 : stageCompleted ? 1 : 0.72)) / game.stages.length) * 100);

  return (
    <main className="min-h-screen bg-[#070b18] px-4 py-5 text-white sm:px-6">
      <div className="mx-auto w-full max-w-5xl">
        <header className="rounded-[2rem] border border-white/10 bg-[#10162f]/95 p-4 shadow-2xl sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#8be9fd]">
                {career.shortTitle} · Ca {stageIndex + 1}/{game.stages.length}
              </p>
              <h1 className="mt-1 text-2xl font-black text-[#fff8f0] sm:text-3xl">{stage.title}</h1>
            </div>
            <button type="button" onClick={onBack} className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black text-[#dbe4ff] hover:bg-white/15">
              Chọn ngành
            </button>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-[#63e6a8] transition-all" style={{ width: `${progressPercent}%` }} />
          </div>
        </header>

        {phase === 'briefing' && (
          <section className="mt-5 grid gap-5 rounded-[2rem] border border-white/10 bg-[#10162f]/95 p-5 shadow-2xl md:grid-cols-[300px_minmax(0,1fr)] sm:p-6">
            <div className="self-center">
              <CharacterPortrait actor={actor} mood={activeTone} isThinking={isLoadingIntro} size="hero" />
            </div>
            <div className="flex min-h-[420px] flex-col justify-center">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#8be9fd]">Nhân vật giao ca</p>
              <h2 className="mt-2 text-3xl font-black text-[#ffe066]">{actor.name}</h2>
              <p className="mt-1 text-sm font-bold text-[#9fa8d8]">{actor.role}</p>

              <div className="mt-5 rounded-[2rem] border-2 border-[#070a17] bg-[#fff8f0] p-5 text-[#172033] shadow-[7px_7px_0_#070a17]">
                {isLoadingIntro ? (
                  <p className="font-black leading-7 text-[#6b5c43]">{actor.name} đang gõ...</p>
                ) : (
                  <p className="whitespace-pre-line text-lg font-black leading-8">{actorMessage}</p>
                )}
              </div>

              <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#63e6a8]">Mini game tiếp theo</p>
                <p className="mt-2 text-xl font-black text-white">{stage.task.title}</p>
                <p className="mt-1 text-sm font-semibold leading-6 text-[#cbd5ff]">{compactText(stage.task.brief, 110)}</p>
              </div>

              <button type="button" onClick={() => setPhase('task')} className="mt-5 rounded-2xl bg-[#ffe066] px-6 py-4 text-base font-black text-[#172033] shadow-[0_16px_32px_rgba(0,0,0,0.28)] transition hover:-translate-y-0.5">
                BẮT ĐẦU MINI GAME
              </button>
            </div>
          </section>
        )}

        {phase === 'task' && (
          <section className="mt-5 rounded-[2rem] border border-white/10 bg-[#10162f]/95 p-5 shadow-2xl sm:p-6">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#8be9fd]">Nhiệm vụ nghề nghiệp</p>
                <h2 className="mt-1 text-3xl font-black text-[#fff8f0]">{stage.task.title}</h2>
                <div className="mt-3 max-w-3xl rounded-2xl border border-[#ffe066]/25 bg-[#ffe066]/5 p-3"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#ffe066]">Chuyện gì đang xảy ra?</p><p className="mt-1 text-sm font-semibold leading-6 text-[#cbd5ff]">{stage.context}</p></div>
              </div>
              <span className="rounded-full border border-[#ffe066]/40 bg-[#ffe066]/10 px-4 py-2 text-xs font-black text-[#ffe066]">
                {taskTypeLabel(stage.task.type)}
              </span>
            </div>

            <IndustryTaskPanel
              task={stage.task}
              taskSubmitted={taskSubmitted}
              taskResult={taskResult}
              allocationValues={allocationValues}
              setAllocationValues={setAllocationValues}
              sortingValues={sortingValues}
              setSortingValues={setSortingValues}
              priorityItems={priorityItems}
              setPriorityItems={setPriorityItems}
              layoutValues={layoutValues}
              setLayoutValues={setLayoutValues}
              riskChoices={riskChoices}
              setRiskChoices={setRiskChoices}
              onSubmit={submitTask}
              validationMessage={taskValidationMessage}
            />
          </section>
        )}

        {phase === 'chat' && (
          <section className="mt-5 grid gap-5 lg:grid-cols-[230px_minmax(0,1fr)] lg:items-start">
            <aside className="rounded-[2rem] border border-white/10 bg-[#10162f]/95 p-4 text-center shadow-2xl">
              <CharacterPortrait actor={actor} mood={activeTone} isThinking={isSending} size="compact" />
              <p className="mt-4 text-lg font-black text-[#fff8f0]">{actor.name}</p>
              <p className="mt-1 text-xs font-bold text-[#9fa8d8]">{actor.statusLabel}</p>
              {taskResult && (
                <div className="mt-4 rounded-2xl border border-[#63e6a8]/30 bg-[#63e6a8]/10 p-3 text-left">
                  <p className="text-xs font-black text-[#63e6a8]">Mini game</p>
                  <p className="mt-1 text-2xl font-black text-white">{taskResult.score}/100</p>
                  <details className="mt-1 text-xs text-[#cbd5ff]">
                    <summary className="cursor-pointer font-bold text-[#ffe066]">Xem phân tích</summary>
                    <p className="mt-2 leading-5">{taskResult.summary}</p>
                  </details>
                </div>
              )}
            </aside>

            <section className="overflow-hidden rounded-[2rem] border-2 border-[#070a17] bg-[#f8f4e8] text-[#172033] shadow-[7px_7px_0_#070a17]">
              <div className="flex items-center gap-3 border-b-2 border-[#070a17] bg-[#171d3d] px-4 py-3 text-white">
                <img src={getCharacterSpritePath(actor.id, activeTone)} alt={actor.name} className="size-11 rounded-xl border-2 border-[#ffe066] bg-[#0f1430] object-contain p-1 pixelated" draggable={false} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black">{actor.name}</p>
                  <p className="truncate text-xs font-bold text-[#8be9fd]">đang trao đổi công việc</p>
                </div>
                <span className="rounded-full bg-[#63e6a8]/15 px-3 py-1 text-[10px] font-black text-[#63e6a8]">ONLINE</span>
              </div>

              <div className="max-h-[360px] space-y-3 overflow-y-auto bg-[linear-gradient(180deg,#fff8f0,#ece6d9)] p-4">
                {chatMessages.map((message) => (
                  <DialogueBubble
                    key={message.id}
                    message={message}
                    actorId={actor.id}
                    actorName={actor.name}
                    actorAccent={actor.accent}
                    mood={message.tone || activeTone}
                  />
                ))}
                {isSending && <LoadingBubble text={`${actor.name} đang gõ...`} />}
              </div>

              {!stageCompleted && (
                <div className="border-t-2 border-[#070a17] bg-[#f8f4e8] p-3">
                  <label htmlFor="industry-answer" className="sr-only">Trả lời nhân vật</label>
                  <div className="flex gap-3">
                    <textarea
                      id="industry-answer"
                      value={draft}
                      disabled={isLoadingIntro || isSending}
                      onChange={(event) => setDraft(event.target.value)}
                      placeholder="Ví dụ: Em sẽ kiểm tra A trước vì... Sau đó em sẽ..."
                      className="min-h-20 flex-1 resize-none rounded-2xl border-2 border-[#d6cbb5] bg-white px-4 py-3 text-base font-semibold leading-7 text-[#172033] outline-none focus:border-[#7c3aed] disabled:opacity-60"
                    />
                    <button type="button" disabled={isLoadingIntro || isSending} onClick={submitAnswer} className="self-end rounded-2xl border-2 border-[#070a17] bg-[#ffe066] px-5 py-3 text-sm font-black text-[#172033] shadow-[4px_4px_0_#070a17] transition hover:-translate-y-0.5 disabled:opacity-40">
                      {isSending ? '...' : 'GỬI'}
                    </button>
                  </div>
                  <p className="mt-2 px-2 text-xs font-bold text-[#6b5c43]">Không cần dùng thuật ngữ. Hãy nói theo mẫu: <strong>Em sẽ làm gì → Vì sao → Bước tiếp theo</strong>.</p>
                  {validationMessage && (
                    <p className="mt-3 rounded-2xl border-2 border-[#ffb84d] bg-[#fff0d6] px-3 py-2 text-sm font-bold text-[#8a4b00]">
                      {validationMessage}
                    </p>
                  )}
                </div>
              )}

              {stageCompleted && (
                <div className="border-t-2 border-[#070a17] bg-[#f8f4e8] p-4">
                  <div className="rounded-2xl border-2 border-[#63e6a8] bg-[#e7fff0] px-4 py-3 text-sm font-black text-[#17442d]">
                    Ca này đã đủ dữ liệu. Tiếp tục sang tình huống kế tiếp.
                  </div>
                  <button type="button" onClick={continueNext} className="mt-4 w-full rounded-2xl border-2 border-[#070a17] bg-[#7c3aed] px-6 py-4 text-base font-black text-white shadow-[4px_4px_0_#070a17] transition hover:-translate-y-0.5">
                    {stageIndex < game.stages.length - 1 ? 'CA TIẾP THEO' : 'XEM KẾT QUẢ'}
                  </button>
                </div>
              )}
            </section>
          </section>
        )}
      </div>
    </main>
  );
}


function buildScenarioOverride(stage: IndustryRoleplayStage): RoleplayScenarioOverride {
  const syncedContext = [
    stage.context,
    `Nhiệm vụ nghề nghiệp vừa làm: ${stage.task.title}.`,
    stage.task.brief,
  ]
    .filter(Boolean)
    .join(' ');

  return {
    actorId: stage.actorId,
    stageNumber: stage.stageNumber,
    missionTitle: stage.title,
    missionObjective: stage.playerGoal,
    context: syncedContext,
    initialQuestion: stage.playerGoal,
    mode: 'open',
    maxConversationTurns: 4,
  };
}

function beginnerGuide(task: IndustryTask) {
  const guides: Record<IndustryTask['type'], { action: string; success: string }> = {
    allocation: {
      action: 'Chia tổng 100 điểm cho các việc. Việc nào ảnh hưởng trực tiếp đến kết quả thì nên được ưu tiên hơn.',
      success: 'Khi chia xong, tổng phải đúng 100 điểm. Không cần biết thuật ngữ chuyên ngành để làm bài này.',
    },
    sorting: {
      action: 'Đọc từng thẻ rồi chọn nhóm phù hợp nhất. Nếu chưa chắc, hãy nhìn vào hậu quả của việc đó trước.',
      success: 'Mỗi thẻ chỉ cần chọn một nhóm. Hãy chọn theo tình huống, không cần đoán “đáp án chuyên môn”.',
    },
    priority: {
      action: 'Xếp việc quan trọng nhất lên trên. Hãy nghĩ: việc nào nếu không làm trước sẽ gây hậu quả lớn nhất?',
      success: 'Dùng nút ↑ ↓ để đổi thứ tự. Bạn chỉ cần giải thích được vì sao mình ưu tiên như vậy.',
    },
    layout: {
      action: 'Đặt mỗi phòng vào vị trí phù hợp nhất với cách sử dụng thực tế.',
      success: 'Hãy nghĩ như người sẽ sử dụng không gian này mỗi ngày, không cần biết thuật ngữ kiến trúc.',
    },
    'risk-check': {
      action: 'Chọn những điều bạn cho rằng cần chú ý nhất trong tình huống này.',
      success: 'Không cần chọn nhiều. Hãy chọn những điều nếu bỏ qua có thể gây vấn đề lớn.',
    },
  };
  return guides[task.type];
}

interface IndustryTaskPanelProps {
  task: IndustryTask;
  taskSubmitted: boolean;
  taskResult: TaskResult | null;
  allocationValues: AllocationValues;
  setAllocationValues: (next: AllocationValues | ((current: AllocationValues) => AllocationValues)) => void;
  sortingValues: AssignmentValues;
  setSortingValues: (next: AssignmentValues | ((current: AssignmentValues) => AssignmentValues)) => void;
  priorityItems: string[];
  setPriorityItems: (next: string[] | ((current: string[]) => string[])) => void;
  layoutValues: AssignmentValues;
  setLayoutValues: (next: AssignmentValues | ((current: AssignmentValues) => AssignmentValues)) => void;
  riskChoices: string[];
  setRiskChoices: (next: string[] | ((current: string[]) => string[])) => void;
  onSubmit: () => void;
  validationMessage: string;
}

function IndustryTaskPanel({
  task,
  taskSubmitted,
  taskResult,
  allocationValues,
  setAllocationValues,
  sortingValues,
  setSortingValues,
  priorityItems,
  setPriorityItems,
  layoutValues,
  setLayoutValues,
  riskChoices,
  setRiskChoices,
  onSubmit,
  validationMessage,
}: IndustryTaskPanelProps) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-[#151b38]/95 p-4 sm:p-5">
      <div className="rounded-2xl border-2 border-[#8be9fd]/30 bg-[#8be9fd]/10 p-4">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8be9fd]">Hướng dẫn cho người mới</p>
        <p className="mt-2 text-sm font-black leading-6 text-white">{beginnerGuide(task).action}</p>
        <p className="mt-2 text-xs font-semibold leading-5 text-[#cbd5ff]">{beginnerGuide(task).success}</p>
      </div>
      <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#ffe066]">Tình huống</p>
        <p className="mt-1 text-sm font-semibold leading-6 text-[#dbe4ff]">{task.brief}</p>
      </div>

      <div className="mt-5">
        {task.type === 'allocation' && (
          <AllocationTaskView task={task} disabled={taskSubmitted} values={allocationValues} setValues={setAllocationValues} />
        )}
        {task.type === 'sorting' && (
          <SortingTaskView task={task} disabled={taskSubmitted} values={sortingValues} setValues={setSortingValues} />
        )}
        {task.type === 'priority' && (
          <PriorityTaskView task={task} disabled={taskSubmitted} order={priorityItems} setOrder={setPriorityItems} />
        )}
        {task.type === 'layout' && (
          <LayoutTaskView task={task} disabled={taskSubmitted} values={layoutValues} setValues={setLayoutValues} />
        )}
        {task.type === 'risk-check' && (
          <RiskCheckTaskView task={task} disabled={taskSubmitted} choices={riskChoices} setChoices={setRiskChoices} />
        )}
      </div>

      {validationMessage && (
        <p className="mt-4 rounded-2xl border border-[#ffb84d]/50 bg-[#ffb84d]/10 px-3 py-2 text-sm font-bold text-[#ffe0aa]">
          {validationMessage}
        </p>
      )}

      {taskResult && (
        <div className="mt-4 rounded-3xl border border-[#63e6a8]/40 bg-[#63e6a8]/10 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-black text-[#63e6a8]">Điểm mini game</p>
            <span className="rounded-full bg-[#63e6a8] px-4 py-1 text-sm font-black text-[#10251e]">{taskResult.score}/100</span>
          </div>
          <p className="mt-2 text-sm font-semibold leading-6 text-[#dbe4ff]">{compactText(taskResult.summary, 140)}</p>
        </div>
      )}

      {!taskSubmitted && (
        <button type="button" onClick={onSubmit} className="mt-5 w-full rounded-2xl bg-[#ffe066] px-5 py-4 text-base font-black text-[#172033] shadow-[0_12px_28px_rgba(0,0,0,0.25)] transition hover:-translate-y-0.5">
          NỘP MINI GAME
        </button>
      )}
    </div>
  );
}

function AllocationTaskView({ task, disabled, values, setValues }: { task: AllocationTask; disabled: boolean; values: AllocationValues; setValues: IndustryTaskPanelProps['setAllocationValues'] }) {
  const total = task.items.reduce((sum, item) => sum + Number(values[item.id] || 0), 0);
  return (
    <div className="space-y-3">
      <div className={`rounded-2xl border px-3 py-2 text-sm font-black ${total === task.total ? 'border-[#63e6a8]/50 bg-[#63e6a8]/10 text-[#63e6a8]' : 'border-[#ffb84d]/50 bg-[#ffb84d]/10 text-[#ffe0aa]'}`}>
        Tổng: {total}/{task.total} {task.unitLabel}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {task.items.map((item) => (
          <label key={item.id} className="rounded-2xl border border-white/10 bg-[#0f142c] p-3">
            <div className="flex items-center justify-between gap-3">
              <span className="font-black text-[#fff8f0]">{item.label}</span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-black text-[#ffe066]">{values[item.id] || 0}</span>
            </div>
            <input
              type="range"
              min={0}
              max={task.total}
              disabled={disabled}
              value={values[item.id] || 0}
              onChange={(event) => {
                const nextValue = Number(event.target.value);
                setValues((current) => ({ ...current, [item.id]: nextValue }));
              }}
              className="mt-3 w-full accent-[#ffe066]"
            />
            <p className="mt-1 text-xs leading-5 text-[#9fa8d8]">{item.helper}</p>
          </label>
        ))}
      </div>
    </div>
  );
}

function SortingTaskView({ task, disabled, values, setValues }: { task: SortingTask; disabled: boolean; values: AssignmentValues; setValues: IndustryTaskPanelProps['setSortingValues'] }) {
  return (
    <div className="grid gap-3">
      {task.cards.map((card) => (
        <div key={card.id} className="grid gap-3 rounded-2xl border border-white/10 bg-[#0f142c] p-3 sm:grid-cols-[1fr_220px] sm:items-center">
          <div>
            <p className="font-black text-[#fff8f0]">{card.label}</p>
            <p className="mt-1 text-xs leading-5 text-[#9fa8d8]">{card.helper}</p>
          </div>
          <select
            disabled={disabled}
            value={values[card.id] || ''}
            onChange={(event) => setValues((current) => ({ ...current, [card.id]: event.target.value }))}
            className="w-full rounded-2xl border border-white/15 bg-[#fff8f0] px-3 py-3 font-black text-[#172033] outline-none focus:border-[#ffe066] disabled:opacity-70"
          >
            <option value="">Chọn nhóm</option>
            {task.groups.map((group) => (
              <option key={group.id} value={group.id}>{group.label}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}

function PriorityTaskView({ task, disabled, order, setOrder }: { task: PriorityTask; disabled: boolean; order: string[]; setOrder: IndustryTaskPanelProps['setPriorityItems'] }) {
  function move(itemId: string, direction: -1 | 1) {
    if (disabled) return;
    setOrder((current) => {
      const index = current.indexOf(itemId);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  }

  return (
    <div className="space-y-3">
      {order.map((itemId, index) => {
        const item = task.items.find((candidate) => candidate.id === itemId);
        if (!item) return null;
        return (
          <div key={item.id} className="grid gap-3 rounded-2xl border border-white/10 bg-[#0f142c] p-3 sm:grid-cols-[44px_1fr_110px] sm:items-center">
            <span className="text-xl font-black text-[#ffe066]">#{index + 1}</span>
            <div>
              <p className="font-black text-[#fff8f0]">{item.label}</p>
              <p className="mt-1 text-xs leading-5 text-[#9fa8d8]">{item.helper}</p>
            </div>
            <div className="flex gap-2">
              <button type="button" disabled={disabled || index === 0} onClick={() => move(item.id, -1)} className="flex-1 rounded-xl border border-white/15 bg-white/10 px-2 py-2 font-black text-[#8be9fd] disabled:opacity-30">↑</button>
              <button type="button" disabled={disabled || index === order.length - 1} onClick={() => move(item.id, 1)} className="flex-1 rounded-xl border border-white/15 bg-white/10 px-2 py-2 font-black text-[#8be9fd] disabled:opacity-30">↓</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LayoutTaskView({ task, disabled, values, setValues }: { task: LayoutTask; disabled: boolean; values: AssignmentValues; setValues: IndustryTaskPanelProps['setLayoutValues'] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {task.zones.map((zone) => (
        <div key={zone.id} className="rounded-2xl border border-white/10 bg-[#0f142c] p-3">
          <p className="font-black text-[#ffe066]">{zone.label}</p>
          <p className="mt-1 text-xs leading-5 text-[#9fa8d8]">{zone.helper}</p>
          <select
            disabled={disabled}
            value={values[zone.id] || ''}
            onChange={(event) => setValues((current) => ({ ...current, [zone.id]: event.target.value }))}
            className="mt-3 w-full rounded-2xl border border-white/15 bg-[#fff8f0] px-3 py-3 font-black text-[#172033] outline-none focus:border-[#ffe066] disabled:opacity-70"
          >
            <option value="">Chọn phòng</option>
            {task.rooms.map((room) => (
              <option key={room.id} value={room.id}>{room.label}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}

function RiskCheckTaskView({ task, disabled, choices, setChoices }: { task: RiskCheckTask; disabled: boolean; choices: string[]; setChoices: IndustryTaskPanelProps['setRiskChoices'] }) {
  function toggle(choiceId: string) {
    if (disabled) return;
    setChoices((current) => {
      if (current.includes(choiceId)) return current.filter((id) => id !== choiceId);
      if (current.length >= task.maxChoices) return current;
      return [...current, choiceId];
    });
  }

  return (
    <div className="space-y-3">
      <p className="rounded-2xl border border-[#8be9fd]/40 bg-[#8be9fd]/10 px-3 py-2 text-sm font-black text-[#8be9fd]">
        Đã chọn {choices.length}/{task.maxChoices}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {task.choices.map((choice) => (
          <label key={choice.id} className={`block cursor-pointer rounded-2xl border p-3 ${choices.includes(choice.id) ? 'border-[#63e6a8]/60 bg-[#63e6a8]/10' : 'border-white/10 bg-[#0f142c]'}`}>
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                disabled={disabled}
                checked={choices.includes(choice.id)}
                onChange={() => toggle(choice.id)}
                className="mt-1 size-5 accent-[#63e6a8]"
              />
              <div>
                <p className="font-black text-[#fff8f0]">{choice.label}</p>
                <p className="mt-1 text-xs leading-5 text-[#9fa8d8]">{choice.helper}</p>
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}

function DialogueBubble({
  message,
  actorId,
  actorName,
  actorAccent,
  mood,
}: {
  message: DialogueMessage;
  actorId: RoleplayActorId;
  actorName: string;
  actorAccent: string;
  mood?: RoleplayTone;
}) {
  const isPlayer = message.speaker === 'player';
  const bubbleBase = 'max-w-[82%] whitespace-pre-line px-4 py-3 text-sm font-bold leading-6 shadow-[4px_4px_0_#070a17] sm:text-base sm:leading-7';

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex items-end gap-2 ${isPlayer ? 'justify-end' : 'justify-start'}`}>
      {!isPlayer && (
        <img src={getCharacterSpritePath(actorId, mood)} alt={actorName} className="size-11 shrink-0 rounded-xl border-2 border-[#070a17] bg-[#171d3d] object-contain p-1 pixelated" draggable={false} />
      )}
      <div className={`${bubbleBase} ${isPlayer ? 'rounded-3xl rounded-br-md border-2 border-[#070a17] bg-[#dfffe9] text-[#142719]' : 'rounded-3xl rounded-bl-md border-2 border-[#070a17] bg-white text-[#172033]'}`}>
        {!isPlayer && (
          <p className="mb-1 text-[10px] font-black uppercase tracking-[0.16em]" style={{ color: actorAccent }}>
            {actorName}
          </p>
        )}
        {message.text}
      </div>
      {isPlayer && (
        <div className="grid size-10 shrink-0 place-items-center rounded-xl border-2 border-[#070a17] bg-[#7c3aed] text-sm font-black text-white shadow-[3px_3px_0_#070a17]">BẠN</div>
      )}
    </motion.div>
  );
}

function LoadingBubble({ text }: { text: string }) {
  return (
    <div className="flex items-end gap-2">
      <div className="size-11 shrink-0 rounded-xl border-2 border-[#070a17] bg-[#171d3d] p-1" />
      <div className="rounded-3xl rounded-bl-md border-2 border-[#070a17] bg-white px-4 py-3 text-sm font-black text-[#6b5c43] shadow-[4px_4px_0_#070a17]">
        {text} <span className="inline-block animate-pulse">● ● ●</span>
      </div>
    </div>
  );
}

function compactText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
}

function taskTypeLabel(type: IndustryTask['type']) {
  const labels: Record<IndustryTask['type'], string> = {
    allocation: 'Phân bổ',
    sorting: 'Phân loại',
    priority: 'Ưu tiên',
    layout: 'Bố trí',
    'risk-check': 'Kiểm tra rủi ro',
  };
  return labels[type];
}

function scoreIndustryAnswer(stage: IndustryRoleplayStage, text: string) {
  const normalized = normalizeText(text);
  const wordCount = normalized.split(/\s+/).filter(Boolean).length;
  const strongHits = stage.strongSignals.filter((signal) => normalized.includes(normalizeText(signal))).length;
  const weakHits = stage.weakSignals.filter((signal) => normalized.includes(normalizeText(signal))).length;

  let score = Math.min(88, 45 + wordCount * 2 + strongHits * 8 - weakHits * 6);
  if (wordCount < 12) score -= 12;
  if (strongHits >= 3) score += 10;
  return Math.max(25, Math.min(100, Math.round(score)));
}

function buildIndustryAnalysis(
  careerId: CareerId,
  finalScore: number,
  answers: OpenAnswer[],
  turns: RoleplayTurn[],
  stages: IndustryRoleplayStage[],
): CareerAnalysis {
  const careerNameMap: Record<CareerId, string> = {
    it: 'Công nghệ thông tin',
    business: 'Quản trị kinh doanh',
    architecture: 'Kiến trúc',
    pharmacy: 'Dược',
    marketing: 'Marketing',
    accounting: 'Kế toán - Tài chính',
    ecommerce: 'Thương mại điện tử',
    uiux: 'Thiết kế UI/UX',
  };

  const careerName = careerNameMap[careerId] || 'ngành đã chọn';
  const evidence = answers.slice(0, 3).map((answer) => answer.answer.split('\n')[0]).filter(Boolean);
  const roleplayEvidence = turns.slice(0, 2).map((turn) => turn.observation).filter(Boolean);

  return {
    overallScore: finalScore,
    scores: {
      analyticalThinking: Math.min(100, finalScore + 4),
      problemSolving: finalScore,
      communication: Math.max(35, finalScore - 2),
      teamwork: Math.max(35, finalScore - 4),
      adaptability: Math.min(100, finalScore + 2),
      pressureHandling: Math.max(35, finalScore - 6),
      persistence: Math.min(100, finalScore + 3),
    },
    strengths: [
      evidence[0] || 'Biết bắt đầu từ yêu cầu nghề nghiệp thay vì trả lời theo cảm tính.',
      roleplayEvidence[0] || 'Có tương tác với nhân vật và đưa ra hướng xử lý trong bối cảnh mô phỏng.',
      `Đã hoàn thành ${stages.length} ca trải nghiệm của ngành ${careerName}.`,
    ],
    improvements: [
      'Cần nói ngắn hơn nhưng cụ thể hơn khi bị nhân vật gây áp lực.',
      'Nên nêu rõ thứ tự ưu tiên, rủi ro và mốc hành động trong từng ca.',
      'Cần luyện cách bảo vệ quyết định bằng dữ kiện, không chỉ bằng cảm giác.',
    ],
    thinkingStyle: finalScore >= 78
      ? 'Có xu hướng xử lý tình huống bằng ưu tiên và dữ kiện.'
      : 'Có tiềm năng nhưng còn dễ trả lời chung khi tình huống bị ép thời gian.',
    personalizedSummary: `Trong trải nghiệm ngành ${careerName}, bạn đã đi qua các mini game nghề nghiệp và phản hồi trực tiếp với nhân vật. Kết quả này phản ánh cách bạn xử lý bối cảnh nghề thật, không phải một bài trắc nghiệm chọn đáp án.`,
    careerFit: finalScore >= 80
      ? `CÓ NHIỀU TỐ CHẤT PHÙ HỢP VỚI ${careerName.toUpperCase()}`
      : finalScore >= 62
        ? `CÓ TIỀM NĂNG VỚI ${careerName.toUpperCase()} — NÊN TRẢI NGHIỆM THÊM`
        : `CHƯA ĐỦ CHẮC ĐỂ KẾT LUẬN PHÙ HỢP VỚI ${careerName.toUpperCase()}`,
    suitableRoles: buildSuitableRoles(careerId),
  };
}

function buildSuitableRoles(careerId: CareerId) {
  const roles: Record<CareerId, string[]> = {
    it: ['Software Developer', 'QA / Tester', 'Business Analyst'],
    business: ['Business Analyst', 'Operations Executive', 'Account Executive'],
    architecture: ['Architect Assistant', 'Interior Designer', 'Site Coordinator'],
    pharmacy: ['Pharmacy Assistant', 'Medical Sales Representative', 'Clinical Support'],
    marketing: ['Campaign Planner', 'Content Marketer', 'Social Media Executive'],
    accounting: ['Accountant Assistant', 'Internal Control Staff', 'Financial Analyst Intern'],
    ecommerce: ['E-commerce Operations', 'Marketplace Executive', 'Online Store Coordinator'],
    uiux: ['UI Designer', 'UX Research Assistant', 'Product Designer Intern'],
  };
  return roles[careerId] || ['Career Explorer'];
}

function normalizeText(text: string) {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
