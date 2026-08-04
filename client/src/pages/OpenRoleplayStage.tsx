import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { CharacterPortrait, getCharacterSpritePath } from '../components/CharacterPortrait';
import { PixelSceneBackground } from '../components/PixelSceneBackground';
import type { PlayerProfile } from './PlayerProfilePage';
import { CharacterBriefingPage } from './CharacterBriefingPage';
import type { OpenMission } from '../game/hybridMissionData';
import type { OpenAnswer, RoleplayTurn } from '../game/hybridMissionTypes';
import {
  getRoleplayActor,
  getRoleplayScenario,
  type RoleplayActorId,
} from '../game/roleplayScenarioData';
import {
  sendRoleplayTurn,
  type RoleplayIntro,
  type RoleplayReply,
} from '../services/roleplayService';

interface OpenRoleplayStageResult {
  openAnswer: OpenAnswer;
  roleplayTurns: RoleplayTurn[];
}

interface OpenRoleplayStageProps {
  mission: OpenMission;
  playerProfile: PlayerProfile;
  onBack: () => void;
  onComplete: (result: OpenRoleplayStageResult) => void;
}

type Screen = 'briefing' | 'conversation';

interface ChatMessage {
  id: string;
  speaker: 'actor' | 'player';
  name: string;
  avatar: string;
  text: string;
  mood?: string;
}

const sceneByActor: Partial<Record<RoleplayActorId, 'office' | 'client' | 'qa' | 'deadline' | 'team' | 'mentor'>> = {
  'boss-byte': 'office',
  'client-linh': 'client',
  'qa-an': 'qa',
  'pm-trang': 'deadline',
  'teammate-minh': 'team',
  'mentor-nova': 'mentor',
};

export function OpenRoleplayStage({
  mission,
  playerProfile,
  onBack,
  onComplete,
}: OpenRoleplayStageProps) {
  const scenario = getRoleplayScenario(mission.stageId);
  const actor = scenario ? getRoleplayActor(scenario.actorId) : null;
  const [screen, setScreen] = useState<Screen>('briefing');
  const [intro, setIntro] = useState<RoleplayIntro | null>(null);
  const [interactionId, setInteractionId] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [playerResponses, setPlayerResponses] = useState<string[]>([]);
  const [roleplayTurns, setRoleplayTurns] = useState<RoleplayTurn[]>([]);
  const [answer, setAnswer] = useState('');
  const [secondsPassed, setSecondsPassed] = useState(0);
  const [turnNumber, setTurnNumber] = useState(1);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [completionReply, setCompletionReply] = useState<RoleplayReply | null>(null);

  useEffect(() => {
    setScreen('briefing');
    setIntro(null);
    setInteractionId('');
    setMessages([]);
    setPlayerResponses([]);
    setRoleplayTurns([]);
    setAnswer('');
    setSecondsPassed(0);
    setTurnNumber(1);
    setIsSending(false);
    setErrorMessage('');
    setCompletionReply(null);
  }, [mission.id]);

  useEffect(() => {
    if (screen !== 'conversation' || completionReply) {
      return;
    }

    const timer = window.setInterval(() => {
      setSecondsPassed((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [screen, completionReply]);

  const currentPrompt = useMemo(() => {
    const lastActorMessage = [...messages].reverse().find((item) => item.speaker === 'actor');
    return lastActorMessage?.text ?? scenario?.initialQuestion ?? '';
  }, [messages, scenario?.initialQuestion]);

  if (!scenario || !actor) {
    return null;
  }

  const activeScenario = scenario;
  const lastActorMood = [...messages].reverse().find((item) => item.speaker === 'actor')?.mood;
  const mood = completionReply?.tone ?? lastActorMood ?? intro?.tone ?? 'neutral';

  if (screen === 'briefing') {
    return (
      <CharacterBriefingPage
        stageId={mission.stageId}
        playerProfile={playerProfile}
        onBack={onBack}
        onAccept={(acceptedIntro) => {
          setIntro(acceptedIntro);
          setInteractionId(acceptedIntro.interactionId);
          setMessages([
            {
              id: `actor-intro-${mission.id}`,
              speaker: 'actor',
              name: acceptedIntro.actorName,
              avatar: acceptedIntro.actorAvatar,
              text: acceptedIntro.question || scenario.initialQuestion || acceptedIntro.message,
              mood: acceptedIntro.tone,
            },
          ]);
          setScreen('conversation');
        }}
      />
    );
  }

  async function submitAnswer() {
    const cleanAnswer = answer.trim();

    if (cleanAnswer.length < mission.minimumLength) {
      setErrorMessage(
        `Nói rõ hơn chút. Câu này ngắn quá nên nhân vật chưa có gì để phản ứng.`,
      );
      return;
    }

    setErrorMessage('');
    setIsSending(true);

    const playerMessage: ChatMessage = {
      id: `player-${mission.id}-${turnNumber}-${Date.now()}`,
      speaker: 'player',
      name: playerProfile.fullName,
      avatar: '🧑‍💻',
      text: cleanAnswer,
    };

    setMessages((current) => [...current, playerMessage]);
    setAnswer('');

    try {
      const reply = await sendRoleplayTurn({
        stageId: mission.stageId,
        playerProfile,
        previousInteractionId: interactionId || intro?.interactionId,
        eventType: turnNumber === 1 ? 'player_response' : 'follow_up_response',
        playerMessage: cleanAnswer,
        turnNumber,
        timeTaken: secondsPassed,
      });

      const actorResponseText = reply.shouldContinue && reply.followUpQuestion
        ? `${reply.message}\n\n${reply.followUpQuestion}`
        : reply.message;

      setInteractionId(reply.interactionId || interactionId);
      setPlayerResponses((current) => [...current, cleanAnswer]);
      setRoleplayTurns((current) => [
        ...current,
        {
          stageId: mission.stageId,
          stageNumber: mission.stageNumber,
          actorId: reply.actorId,
          actorName: reply.actorName,
          actorRole: reply.actorRole,
          aiMessage: actorResponseText,
          playerResponse: cleanAnswer,
          eventType: turnNumber === 1 ? 'player_response' : 'follow_up_response',
          timeTaken: secondsPassed,
          observation: reply.observation,
        },
      ]);
      setMessages((current) => [
        ...current,
        {
          id: `actor-${mission.id}-${turnNumber}-${Date.now()}`,
          speaker: 'actor',
          name: reply.actorName,
          avatar: reply.actorAvatar,
          text: actorResponseText,
          mood: reply.tone,
        },
      ]);

      const reachedMaxTurns = turnNumber >= activeScenario.maxConversationTurns;

      if (reply.stageComplete || !reply.shouldContinue || reachedMaxTurns) {
        setCompletionReply(reply);
      } else {
        setTurnNumber((current) => current + 1);
      }
    } finally {
      setIsSending(false);
    }
  }

  function finishStage() {
    const responses = [...playerResponses];

    if (responses.length === 0 && answer.trim()) {
      responses.push(answer.trim());
    }

    onComplete({
      openAnswer: {
        stageId: mission.id,
        question: activeScenario.initialQuestion ?? currentPrompt,
        answer: responses.join('\n\n--- PHẢN HỒI TIẾP THEO ---\n\n'),
        timeTaken: secondsPassed,
      },
      roleplayTurns,
    });
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0d1024] px-3 py-4 text-white sm:px-5 sm:py-6 lg:px-8">
      <PixelSceneBackground accent={actor.accent} scene={sceneByActor[actor.id] ?? 'office'} />

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <header className="border-4 border-[#4d568c] bg-[#11162f]/90 p-4 shadow-[6px_6px_0_#070a17]">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-[10px] font-black tracking-[0.3em] text-[#8be9fd] sm:text-xs">
                ĐỐI THOẠI · STAGE {mission.stageNumber} / 6
              </p>
              <h1 className="mt-2 text-xl font-black text-[#ffe066] sm:text-3xl">
                {mission.title}
              </h1>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <HudBox label="NPC" value={actor.name} />
              <HudBox label="TURN" value={`${turnNumber}/${activeScenario.maxConversationTurns}`} />
              <HudBox label="TIME" value={formatTime(secondsPassed)} />
            </div>
          </div>
        </header>

        <section className="mt-5 grid gap-5 lg:grid-cols-[330px_minmax(0,1fr)]">
          <aside className="pixel-panel flex flex-col justify-between p-4 sm:p-5">
            <CharacterPortrait actor={actor} size="large" mood={mood} isThinking={isSending} />
            <div className="mt-8 grid grid-cols-2 gap-2 text-center">
              <MiniTag label="Quan sát" value={actor.visualTags[0] ?? 'Tư duy'} color={actor.accent} />
              <MiniTag label="Bối cảnh" value={actor.workspace.split('·')[0].trim()} color="#8be9fd" />
            </div>
          </aside>

          <section className="grid gap-4">
            <div className="flex min-h-[460px] flex-col overflow-hidden rounded-[2rem] border-2 border-[#070a17] bg-[#f8f4e8] shadow-[7px_7px_0_#070a17]">
              <div className="flex items-center gap-3 border-b-2 border-[#070a17] bg-[#171d3d] px-4 py-3">
                <img
                  src={getCharacterSpritePath(actor.id, mood)}
                  alt={actor.name}
                  className="size-12 rounded-xl border-2 border-[#ffe066] bg-[#0f1430] object-contain p-1 pixelated"
                  draggable={false}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black text-white">{actor.name}</p>
                  <p className="truncate text-xs font-bold text-[#8be9fd]">{actor.role}</p>
                </div>
                <div className="hidden rounded-full bg-[#63e6a8]/15 px-3 py-1 text-[10px] font-black text-[#63e6a8] sm:flex sm:items-center sm:gap-2">
                  <span className="size-2 rounded-full bg-[#63e6a8]" /> ĐANG ONLINE
                </div>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto bg-[linear-gradient(180deg,#fff8f0,#ece6d9)] p-4 sm:p-5">
                {messages.map((message) => (
                  <ChatBubble
                    key={message.id}
                    message={message}
                    actorId={actor.id}
                    actorAccent={actor.accent}
                  />
                ))}

                {isSending && (
                  <TypingBubble actorId={actor.id} actorName={actor.name} mood={mood} />
                )}
              </div>
            </div>

            {completionReply ? (
              <div className="pixel-panel p-4 sm:p-5">
                <div className="grid gap-4 md:grid-cols-[160px_minmax(0,1fr)] md:items-center">
                  <CharacterPortrait actor={actor} size="compact" mood="happy" />
                  <div>
                    <p className="text-[10px] font-black tracking-[0.28em] text-[#63e6a8]">STAGE CLEAR</p>
                    <h2 className="mt-2 text-2xl font-black text-[#ffe066]">Hoàn thành hội thoại</h2>
                    <p className="mt-2 text-sm leading-7 text-[#d6d9ff]">
                      Đoạn này đã đủ. Đi tiếp để xem tình huống sau khó hơn thế nào.
                    </p>
                    <button type="button" onClick={finishStage} className="pixel-button mt-4 w-full px-6 py-4 text-base sm:w-auto">
                      TIẾP TỤC HÀNH TRÌNH ▶
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-[2rem] border-2 border-[#070a17] bg-[#f8f4e8] p-3 text-[#172033] shadow-[7px_7px_0_#070a17]">
                <div className="flex gap-3">
                  <textarea
                    value={answer}
                    onChange={(event) => setAnswer(event.target.value)}
                    disabled={isSending}
                    rows={4}
                    placeholder="Nhắn câu trả lời của bạn..."
                    className="min-h-24 flex-1 resize-none rounded-2xl border-2 border-[#d6cbb5] bg-white px-4 py-3 text-base font-semibold leading-7 text-[#172033] outline-none placeholder:text-[#8a806d] focus:border-[#7c3aed] disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => void submitAnswer()}
                    disabled={isSending}
                    className="self-end rounded-2xl border-2 border-[#070a17] bg-[#ffe066] px-5 py-3 text-sm font-black text-[#172033] shadow-[4px_4px_0_#070a17] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSending ? '...' : 'GỬI'}
                  </button>
                </div>

                {errorMessage && (
                  <p className="mt-3 rounded-2xl border-2 border-[#ff5c7a] bg-[#ffe2e7] px-3 py-2 text-sm font-bold text-[#8a1029]">
                    {errorMessage}
                  </p>
                )}

                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="px-2 text-xs font-bold text-[#6b5c43]">Trả lời như đang chat công việc thật.</p>
                  <button type="button" onClick={onBack} className="rounded-xl border-2 border-[#070a17] bg-[#282d50] px-4 py-2 text-xs font-black text-white shadow-[3px_3px_0_#070a17]">
                    QUAY LẠI
                  </button>
                </div>
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}

function ChatBubble({
  message,
  actorId,
  actorAccent,
}: {
  message: ChatMessage;
  actorId: RoleplayActorId;
  actorAccent: string;
}) {
  const isActor = message.speaker === 'actor';
  const avatarMood = message.mood || 'neutral';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-end gap-2 ${isActor ? 'justify-start' : 'justify-end'}`}
    >
      {isActor && (
        <img
          src={getCharacterSpritePath(actorId, avatarMood)}
          alt={message.name}
          className="size-12 shrink-0 rounded-xl border-2 border-[#070a17] bg-[#171d3d] object-contain p-1 pixelated"
          draggable={false}
        />
      )}

      <div className={`max-w-[78%] whitespace-pre-line px-4 py-3 text-sm font-bold leading-6 shadow-[4px_4px_0_#070a17] sm:text-base sm:leading-7 ${isActor ? 'rounded-3xl rounded-bl-md border-2 border-[#070a17] bg-white text-[#172033]' : 'rounded-3xl rounded-br-md border-2 border-[#070a17] bg-[#dfffe9] text-[#142719]'}`}>
        {isActor && (
          <p className="mb-1 text-[10px] font-black uppercase tracking-[0.16em]" style={{ color: actorAccent }}>
            {message.name}
          </p>
        )}
        {message.text}
      </div>

      {!isActor && (
        <div className="grid size-10 shrink-0 place-items-center rounded-xl border-2 border-[#070a17] bg-[#7c3aed] text-sm font-black text-white shadow-[3px_3px_0_#070a17]">
          BẠN
        </div>
      )}
    </motion.div>
  );
}

function TypingBubble({ actorId, actorName, mood }: { actorId: RoleplayActorId; actorName: string; mood: string }) {
  return (
    <div className="flex items-end gap-2">
      <img
        src={getCharacterSpritePath(actorId, mood)}
        alt={actorName}
        className="size-12 shrink-0 rounded-xl border-2 border-[#070a17] bg-[#171d3d] object-contain p-1 pixelated"
        draggable={false}
      />
      <div className="rounded-3xl rounded-bl-md border-2 border-[#070a17] bg-white px-4 py-3 text-sm font-black text-[#6b5c43] shadow-[4px_4px_0_#070a17]">
        {actorName} đang gõ <span className="inline-block animate-pulse">● ● ●</span>
      </div>
    </div>
  );
}

function HudBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-2 border-[#4d568c] bg-[#0f1430] px-3 py-2 text-center">
      <p className="text-[9px] font-black tracking-[0.18em] text-[#8be9fd]">{label}</p>
      <p className="mt-1 text-xs font-black text-[#ffe066] sm:text-sm">{value}</p>
    </div>
  );
}

function MiniTag({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="border-2 bg-[#0f1430] px-2 py-3" style={{ borderColor: color }}>
      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#8be9fd]">{label}</p>
      <p className="mt-1 text-xs font-black text-white">{value}</p>
    </div>
  );
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const rest = (seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${rest}`;
}
