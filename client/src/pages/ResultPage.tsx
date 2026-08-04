import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { motion } from 'motion/react';

import { RadarChart, type RadarMetric } from '../components/RadarChart';
import { CharacterPortrait } from '../components/CharacterPortrait';
import { PixelDialogBox } from '../components/PixelDialogBox';
import { PixelSceneBackground } from '../components/PixelSceneBackground';
import { roleplayActors } from '../game/roleplayScenarioData';
import type { PlayerProfile } from './PlayerProfilePage';
import type { HybridMissionResult } from '../game/hybridMissionTypes';
import { getCareerById, type CareerId } from '../game/careerCatalog';

interface ResultPageProps {
  playerProfile: PlayerProfile;
  careerId: CareerId;
  missionResult: HybridMissionResult;
  premiumUnlocked: boolean;
  onReplayMission: () => void;
  onBackToCareer: () => void;
  onBuyPremiumReport: () => void;
}

type ReportMode = 'teaser' | 'unlock' | 'premium';

export function ResultPage({
  playerProfile,
  careerId,
  missionResult,
  premiumUnlocked,
  onReplayMission,
  onBackToCareer,
  onBuyPremiumReport,
}: ResultPageProps) {
  const [mode, setMode] = useState<ReportMode>(() => premiumUnlocked ? 'premium' : 'teaser');
  const report = useMemo(() => buildReport(playerProfile, careerId, missionResult), [playerProfile, careerId, missionResult]);

  useEffect(() => {
    if (premiumUnlocked) setMode('premium');
  }, [premiumUnlocked]);
  const mentorActor = roleplayActors['mentor-nova'];
  const completedStageCount = missionResult.behaviorEvents.length > 0
    ? 6
    : Math.max(1, missionResult.openAnswers.length);

  if (mode === 'unlock') {
    return (
      <ResultShell>
        <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-8 text-white">
          <div className="grid w-full gap-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-center">
            <div className="flex justify-center lg:justify-start">
              <CharacterPortrait actor={mentorActor} mood="happy" size="hero" />
            </div>

            <div className="pixel-panel p-5 sm:p-7 lg:p-9">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-[#8be9fd]">Premium Report</p>
              <h1 className="mt-3 text-3xl font-black leading-tight text-[#ffe066] sm:text-5xl">
                Mở khóa báo cáo chuyên sâu
              </h1>

              <div className="mt-6">
                <PixelDialogBox
                  actor={mentorActor}
                  text="Bản miễn phí chỉ cho cậu biết mình đang nghiêng về đâu. Nếu muốn đem kết quả này nói chuyện nghiêm túc với gia đình, cậu cần bản phân tích rõ hơn."
                />
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <UnlockItem title="Radar 5 năng lực" text="Nhìn nhanh điểm mạnh, điểm yếu chính." />
                <UnlockItem title="Bóc tách hành vi" text="Sai ở đâu, đúng ở đâu, vì sao." />
                <UnlockItem title="Lộ trình phát triển" text="Việc nên rèn trong 2–4 tuần tới." />
                <UnlockItem title="Parent-Proof Report" text="Bản tóm tắt dễ hiểu cho phụ huynh." />
              </div>

              <div className="mt-7 border-4 border-[#ffe066] bg-[#2a2142] p-5 shadow-[6px_6px_0_#070a17]">
                <p className="text-sm font-black text-[#8be9fd]">GIÁ BÁO CÁO</p>
                <p className="mt-2 text-4xl font-black text-[#ffe066]">20.000 VNĐ</p>
                <p className="mt-2 text-sm leading-6 text-[#d6dcff]">
                  Thanh toán xong, tài khoản sẽ được lưu quyền xem lại báo cáo chuyên sâu cho ngành này.
                </p>
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setMode('teaser')}
                  className="border-4 border-[#7c83a8] bg-[#282d50] px-5 py-4 font-black shadow-[5px_5px_0_#000]"
                >
                  ◀ Quay lại
                </button>
                <button
                  type="button"
                  onClick={onBuyPremiumReport}
                  className="pixel-button flex-1 px-6 py-4 text-base sm:text-lg"
                >
                  ĐI TỚI THANH TOÁN
                </button>
              </div>
            </div>
          </div>
        </section>
      </ResultShell>
    );
  }

  if (mode === 'premium') {
    return (
      <ResultShell>
        <main className="relative z-10 mx-auto w-full max-w-[1500px] px-3 py-5 text-white sm:px-5 lg:px-8">
          <header className="pixel-panel p-4 sm:p-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#63e6a8] sm:text-xs">
                  In-Depth Analytical Report
                </p>
                <h1 className="mt-2 text-2xl font-black text-[#ffe066] sm:text-4xl lg:text-5xl">
                  BÁO CÁO CHUYÊN SÂU
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-[#d6dcff] sm:text-base">
                  Bản này giải thích vì sao hệ thống đưa ra kết quả, không chỉ hiện một con số.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <HudBox label="MATCH" value={`${report.matchPercent}%`} />
                <HudBox label="STAGES" value={`${completedStageCount}/${completedStageCount}`} />
                <HudBox label="AI TURNS" value={`${missionResult.roleplayTurns.length}`} />
                <HudBox label="TIME" value={formatTime(missionResult.timeTaken)} />
              </div>
            </div>
          </header>

          <div className="mt-5 grid gap-5 xl:grid-cols-[380px_minmax(0,1fr)] xl:gap-7">
            <aside className="space-y-5">
              <section className="pixel-panel p-5 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#8be9fd]">Career Match</p>
                <p className="mt-4 text-7xl font-black text-[#ffe066] drop-shadow-[4px_4px_0_#7c3aed] sm:text-8xl">
                  {report.matchPercent}%
                </p>
                <p className="mt-3 text-lg font-black text-[#8be9fd]">{report.topCareer}</p>
                <div className="mt-6 h-5 overflow-hidden border-2 border-[#070a17] bg-[#0f1430]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${report.matchPercent}%` }}
                    transition={{ duration: 1.1 }}
                    className="h-full bg-[#63e6a8]"
                  />
                </div>
              </section>

              <section className="pixel-panel p-4 sm:p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#8be9fd]">Parent-Proof Summary</p>
                <p className="mt-3 text-sm leading-7 text-[#e4e6ff]">{report.parentSummary}</p>
              </section>

              <button
                type="button"
                onClick={() => printParentReport(playerProfile, report)}
                className="pixel-button w-full px-6 py-4 text-base"
              >
                XUẤT PDF CHO PHỤ HUYNH
              </button>
            </aside>

            <section className="min-w-0 space-y-5">
              <Panel title="RADAR 5 NHÓM NĂNG LỰC" category="PREMIUM SECTION" icon="📊">
                <div className="grid gap-5 lg:grid-cols-[420px_minmax(0,1fr)] lg:items-center">
                  <RadarChart metrics={report.radarMetrics} />
                  <div className="space-y-3">
                    {report.radarMetrics.map((metric) => (
                      <SkillLine key={metric.label} label={metric.label} value={metric.value} />
                    ))}
                  </div>
                </div>
              </Panel>

              <Panel title="BÓC TÁCH HÀNH VI" category="BEHAVIOR ANALYSIS" icon="🧠">
                <div className="grid gap-3 lg:grid-cols-2">
                  {report.behaviorBreakdown.map((item, index) => (
                    <BehaviorCard key={`${item.title}-${index}`} index={index + 1} title={item.title} text={item.text} />
                  ))}
                </div>
              </Panel>

              <Panel title="DẪN CHỨNG TỪ PHIÊN CHƠI" category="WHY THIS RESULT" icon="🧩">
                <div className="grid gap-3 lg:grid-cols-3">
                  {report.evidenceBullets.map((item, index) => (
                    <EvidenceCard key={`${item.title}-${index}`} title={item.title} text={item.text} />
                  ))}
                </div>
              </Panel>

              <Panel title="LỘ TRÌNH PHÁT TRIỂN 4 TUẦN" category="ROADMAP" icon="🗺️">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {report.roadmap.map((item) => (
                    <RoadmapCard key={item.week} week={item.week} title={item.title} text={item.text} />
                  ))}
                </div>
              </Panel>

              <div className="grid gap-5 lg:grid-cols-2">
                <Panel title="ĐIỂM MẠNH" category="STRENGTHS" icon="⭐">
                  <ResultList items={missionResult.analysis.strengths} empty="Chưa đủ dữ liệu để xác định điểm mạnh nổi bật." tone="success" />
                </Panel>
                <Panel title="CẦN SỬA TRƯỚC" category="NEXT IMPROVEMENT" icon="⚠️">
                  <ResultList items={missionResult.analysis.improvements} empty="Chưa có gợi ý phát triển." tone="warning" />
                </Panel>
              </div>
            </section>
          </div>

          <BottomActions onBackToCareer={onBackToCareer} onReplayMission={onReplayMission} onTeaser={() => setMode('teaser')} />
        </main>
      </ResultShell>
    );
  }

  return (
    <ResultShell>
      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-8 text-white">
        <div className="grid w-full gap-6 lg:grid-cols-[330px_minmax(0,1fr)] lg:items-center">
          <div className="flex justify-center lg:justify-start">
            <CharacterPortrait actor={mentorActor} mood="neutral" size="hero" />
          </div>

          <div className="pixel-panel p-5 sm:p-7 lg:p-9">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-[#63e6a8]">Free Teaser</p>
            <h1 className="mt-3 text-3xl font-black leading-tight text-[#ffe066] sm:text-5xl">
              Kết quả sơ bộ
            </h1>

            <div className="mt-6 grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-center">
              <div className="border-4 border-[#ffe066] bg-[#10172c] p-5 text-center shadow-[6px_6px_0_#070a17]">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#8be9fd]">Mức phù hợp</p>
                <p className="mt-3 text-7xl font-black text-[#ffe066] drop-shadow-[4px_4px_0_#7c3aed]">
                  {report.matchPercent}%
                </p>
                <p className="mt-3 text-sm font-black text-[#63e6a8]">{report.topCareer}</p>
              </div>

              <div>
                <PixelDialogBox
                  actor={mentorActor}
                  text={report.freeSummary}
                />

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <MiniStat label="TASK" value="3" />
                  <MiniStat label="CHAT" value={`${missionResult.roleplayTurns.length}`} />
                  <MiniStat label="TIME" value={formatTime(missionResult.timeTaken)} />
                </div>
              </div>
            </div>

            <div className="mt-7 rounded-none border-4 border-[#4d568c] bg-[#0b1022] p-4 text-sm leading-7 text-[#c4c8e8] shadow-[5px_5px_0_#070a17]">
              <p>
                Bản miễn phí chỉ cho cậu biết mình đang nghiêng về đâu. Nếu muốn đem kết quả này nói chuyện nghiêm túc với gia đình, cậu cần bản phân tích rõ hơn.
              </p>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onReplayMission}
                className="border-4 border-[#7c83a8] bg-[#282d50] px-5 py-4 font-black shadow-[5px_5px_0_#000]"
              >
                ↻ Làm lại
              </button>
              <button
                type="button"
                onClick={onBuyPremiumReport}
                className="pixel-button flex-1 px-6 py-4 text-base sm:text-lg"
              >
                MỞ BÁO CÁO CHUYÊN SÂU - 10.000 VNĐ
              </button>
            </div>
          </div>
        </div>
      </section>
    </ResultShell>
  );
}

function ResultShell({ children }: { children: ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#0d1024] text-white">
      <PixelSceneBackground scene="mentor" accent="#ffe066" />
      {children}
      <CrtOverlay />
    </main>
  );
}

function Panel({ title, category, icon, children }: { title: string; category: string; icon: string; children: ReactNode }) {
  return (
    <section className="overflow-hidden border-4 border-[#8be9fd] bg-[#11162f] shadow-[6px_6px_0_#070a17]">
      <div className="border-b-4 border-[#30375f] bg-[#181d3a] p-4 sm:p-5">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#8be9fd] sm:text-xs">{category}</p>
        <h2 className="mt-2 text-lg font-black text-[#ffe066] sm:text-xl">{icon} {title}</h2>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

function SkillLine({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-xs font-black text-[#d6d9ff] sm:text-sm">{label}</p>
        <p className="font-black text-[#ffe066]">{value}%</p>
      </div>
      <div className="h-4 overflow-hidden border-2 border-[#070a17] bg-[#0f1430]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1 }}
          className={value >= 80 ? 'h-full bg-[#63e6a8]' : value >= 60 ? 'h-full bg-[#ffe066]' : 'h-full bg-[#ff5c7a]'}
        />
      </div>
    </div>
  );
}

function UnlockItem({ title, text }: { title: string; text: string }) {
  return (
    <div className="border-4 border-[#4d568c] bg-[#10172c] p-4 shadow-[4px_4px_0_#070a17]">
      <p className="font-black text-[#ffe066]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[#c4c8e8]">{text}</p>
    </div>
  );
}

function BehaviorCard({ index, title, text }: { index: number; title: string; text: string }) {
  return (
    <div className="border-4 border-[#4d568c] bg-[#181d3a] p-4 shadow-[4px_4px_0_#070a17]">
      <p className="text-xs font-black text-[#8be9fd]">#{index}</p>
      <h3 className="mt-2 font-black text-[#ffe066]">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-[#e4e6ff]">{text}</p>
    </div>
  );
}

function EvidenceCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="border-4 border-[#63e6a8] bg-[#10251f] p-4 shadow-[4px_4px_0_#070a17]">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#63e6a8]">{title}</p>
      <p className="mt-3 text-sm leading-7 text-[#d6ffec]">{text}</p>
    </div>
  );
}

function RoadmapCard({ week, title, text }: { week: string; title: string; text: string }) {
  return (
    <div className="border-4 border-[#4d568c] bg-[#10172c] p-4 shadow-[4px_4px_0_#070a17]">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-[#63e6a8]">{week}</p>
      <h3 className="mt-2 font-black text-[#ffe066]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#d6dcff]">{text}</p>
    </div>
  );
}

function ResultList({ items, empty, tone }: { items: string[]; empty: string; tone: 'success' | 'warning' }) {
  if (items.length === 0) {
    return <p className="text-sm leading-7 text-[#aeb4dc]">{empty}</p>;
  }

  return (
    <div className="space-y-3">
      {items.slice(0, 4).map((item, index) => (
        <div
          key={`${item}-${index}`}
          className={[
            'border-l-4 bg-[#181d3a] p-3 text-sm leading-6',
            tone === 'success' ? 'border-[#63e6a8] text-[#d6ffec]' : 'border-[#ffb84d] text-[#ffe0b3]',
          ].join(' ')}
        >
          {tone === 'success' ? '✓' : '▶'} {item}
        </div>
      ))}
    </div>
  );
}

function BottomActions({
  onBackToCareer,
  onReplayMission,
  onTeaser,
}: {
  onBackToCareer: () => void;
  onReplayMission: () => void;
  onTeaser: () => void;
}) {
  return (
    <div className="mt-8 flex flex-col gap-3 pb-10 sm:flex-row">
      <button
        type="button"
        onClick={onTeaser}
        className="border-4 border-[#7c83a8] bg-[#282d50] px-5 py-4 font-black shadow-[5px_5px_0_#000]"
      >
        ◀ Bản miễn phí
      </button>
      <button
        type="button"
        onClick={onBackToCareer}
        className="border-4 border-[#7c83a8] bg-[#282d50] px-5 py-4 font-black shadow-[5px_5px_0_#000]"
      >
        Bản đồ nghề nghiệp
      </button>
      <button
        type="button"
        onClick={onReplayMission}
        className="pixel-button flex-1 px-6 py-4 text-base sm:text-lg"
      >
        ↻ Trải nghiệm lại
      </button>
    </div>
  );
}

function HudBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 border-2 border-[#4d568c] bg-[#0f1430] px-2 py-2 text-center">
      <p className="text-[8px] font-black uppercase tracking-wider text-[#8be9fd]">{label}</p>
      <p className="mt-1 truncate text-xs font-black text-[#ffe066] sm:text-sm">{value}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-2 border-[#4d568c] bg-[#0f1430] p-3 text-center">
      <p className="text-[8px] font-black uppercase tracking-[0.15em] text-[#8be9fd]">{label}</p>
      <p className="mt-2 font-black text-[#ffe066]">{value}</p>
    </div>
  );
}

interface DerivedReport {
  matchPercent: number;
  topCareer: string;
  freeSummary: string;
  parentSummary: string;
  radarMetrics: RadarMetric[];
  behaviorBreakdown: Array<{ title: string; text: string }>;
  evidenceBullets: Array<{ title: string; text: string }>;
  roadmap: Array<{ week: string; title: string; text: string }>;
}

function buildReport(playerProfile: PlayerProfile, careerId: CareerId, missionResult: HybridMissionResult): DerivedReport {
  const { analysis } = missionResult;
  const scores = analysis.scores;
  const matchPercent = clamp(Math.round(analysis.overallScore), 0, 100);
  const career = getCareerById(careerId);
  const topCareer = career?.title || analysis.suitableRoles[0] || 'ngành đã chọn';

  const radarMetrics: RadarMetric[] = [
    { label: 'Tư duy logic', shortLabel: 'LOGIC', value: Math.round((scores.analyticalThinking + scores.problemSolving) / 2) },
    { label: 'EQ / Giao tiếp', shortLabel: 'EQ', value: Math.round((scores.communication + scores.teamwork) / 2) },
    { label: 'Xử lý áp lực', shortLabel: 'ÁP LỰC', value: scores.pressureHandling },
    { label: 'Kỹ năng chuyên môn', shortLabel: 'KỸ NĂNG', value: Math.round((scores.analyticalThinking + scores.adaptability) / 2) },
    { label: 'Độ nhạy công việc', shortLabel: 'NHẠY VIỆC', value: Math.round((scores.adaptability + scores.persistence + scores.problemSolving) / 3) },
  ];

  const strongest = [...radarMetrics].sort((a, b) => b.value - a.value)[0];
  const weakest = [...radarMetrics].sort((a, b) => a.value - b.value)[0];

  const freeSummary = makeFreeSummary(playerProfile.fullName, matchPercent, topCareer, strongest.label, weakest.label);

  const firstAnswer = missionResult.openAnswers[0]?.answer || '';
  const strongestEvidence = analysis.strengths[0] || shortEvidence(firstAnswer) || 'Có dữ liệu hoàn thành mini game và trả lời roleplay trong ngành đã chọn.';
  const improvementEvidence = analysis.improvements[0] || 'Cần trả lời cụ thể hơn bằng dữ kiện, thứ tự ưu tiên và hành động tiếp theo.';
  const roleplayEvidence = missionResult.roleplayTurns.find((turn) => turn.observation)?.observation
    || missionResult.roleplayTurns.find((turn) => turn.playerResponse)?.playerResponse
    || 'Chưa có nhiều dữ liệu hội thoại đủ rõ để trích dẫn.';
  const taskEvidence = shortEvidence(firstAnswer) || `Đã hoàn thành ${missionResult.openAnswers.length} nhiệm vụ mô phỏng của ngành ${topCareer}.`;

  const behaviorBreakdown = [
    {
      title: `Cách xử lý nhiệm vụ ${topCareer}`,
      text: taskEvidence,
    },
    {
      title: 'Tín hiệu mạnh nhất',
      text: strongestEvidence,
    },
    {
      title: 'Điểm cần sửa trước',
      text: improvementEvidence,
    },
    {
      title: 'Phản ứng trong chat roleplay',
      text: roleplayEvidence,
    },
  ];

  const evidenceBullets = buildEvidenceBullets(missionResult, topCareer);

  const roadmap = buildCareerRoadmap(careerId, weakest.label, analysis.improvements);

  const parentSummary = `${playerProfile.fullName} đã hoàn thành phiên mô phỏng ngành ${topCareer} với mức phù hợp tham khảo ${matchPercent}%. Điểm nổi bật hiện tại là ${strongest.label.toLowerCase()}; điểm nên rèn tiếp là ${weakest.label.toLowerCase()}. Kết luận này dựa trên mini game, câu trả lời mở và cách phản hồi nhân vật, không phải trắc nghiệm chọn đáp án đơn thuần.`;

  return {
    matchPercent,
    topCareer,
    freeSummary,
    parentSummary,
    radarMetrics,
    behaviorBreakdown,
    evidenceBullets,
    roadmap,
  };
}

function buildEvidenceBullets(missionResult: HybridMissionResult, topCareer: string) {
  const wrongAttempts = missionResult.behaviorEvents.filter((event) => event.eventType === 'wrong_attempt').length;
  const correctAttempts = missionResult.behaviorEvents.filter((event) => event.eventType === 'correct_attempt').length;
  const openText = missionResult.openAnswers.map((answer) => answer.answer).join(' ').toLowerCase();
  const hasPrioritySignal = /ưu tiên|trước|deadline|rủi ro|báo|chia|test|kiểm tra|bàn giao/.test(openText);
  const roleplayCount = missionResult.roleplayTurns.length;

  return [
    {
      title: 'Nhiệm vụ',
      text: wrongAttempts > 0
        ? `Có ${wrongAttempts} lần bị nhắc sai ở nhiệm vụ mô phỏng, nhưng vẫn tiếp tục sửa. Điểm này cho thấy khả năng chịu feedback, không bỏ ngang khi bị bắt lỗi.`
        : `Các task logic đi khá mượt. Hệ thống chưa ghi nhận nhiều lần sai lớn, nên phần tư duy thứ tự là một tín hiệu tích cực.`,
    },
    {
      title: 'Giao tiếp',
      text: hasPrioritySignal
        ? 'Trong phần trả lời mở có dấu hiệu biết nói về ưu tiên, deadline, rủi ro hoặc kiểm tra. Đây là kiểu giao tiếp gần môi trường làm việc thật hơn.'
        : 'Phần trả lời mở còn thiếu dấu hiệu ưu tiên, deadline hoặc rủi ro. Câu trả lời càng cụ thể thì báo cáo càng thuyết phục.',
    },
    {
      title: 'Roleplay',
      text: roleplayCount > 0
        ? `Hệ thống ghi nhận ${roleplayCount} lượt tương tác với nhân vật trong ngành ${topCareer}. Kết quả không chỉ dựa vào điểm, mà còn dựa vào cách người chơi phản ứng trong tình huống nghề nghiệp.`
        : 'Phiên này chưa có nhiều dữ liệu hội thoại. Nếu muốn báo cáo sâu hơn, nên hoàn thành đủ các tình huống roleplay.',
    },
    {
      title: 'Tiến độ',
      text: correctAttempts > 0
        ? `Có ${correctAttempts} lần hoàn thành đúng nhiệm vụ. Đây là bằng chứng trực tiếp cho phần hệ thống chấm năng lực xử lý task.`
        : 'Chưa có nhiều dấu mốc hoàn thành rõ. Người chơi nên làm lại để hệ thống có dữ liệu chắc hơn.',
    },
    {
      title: 'Độ bền',
      text: missionResult.attemptsUsed > 3
        ? 'Số lần thử hơi nhiều, nhưng nếu người chơi vẫn đi tới cuối thì đây là tín hiệu về độ lì và khả năng sửa sai.'
        : 'Số lần thử không quá cao. Điều này giúp báo cáo có cơ sở đánh giá người chơi bắt nhịp tương đối nhanh.',
    },
    {
      title: 'Dữ liệu kết luận',
      text: missionResult.openAnswers.length >= 3
        ? 'Người chơi đã hoàn thành đủ 3 câu trả lời mở, nên phần phân tích tính cách làm việc có cơ sở hơn bản trắc nghiệm chọn đáp án thông thường.'
        : 'Chưa đủ 3 câu trả lời mở, nên kết luận chỉ nên xem là gợi ý ban đầu.',
    },
  ];
}


function shortEvidence(text: string) {
  const clean = text
    .replace(/\[Mini game\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!clean) return '';
  return clean.length > 230 ? `${clean.slice(0, 230).trim()}...` : clean;
}

function buildCareerRoadmap(careerId: CareerId, weakestLabel: string, improvements: string[]) {
  const specific: Record<CareerId, Array<{ week: string; title: string; text: string }>> = {
    it: [
      { week: 'Tuần 1', title: 'Viết luồng trước khi code', text: 'Mỗi task tách thành input, xử lý, output; kiểm tra điều kiện lỗi trước.' },
      { week: 'Tuần 2', title: 'Luyện debug có thứ tự', text: 'Ghi lại lỗi, giả thuyết, bước kiểm tra và kết quả thay vì sửa theo cảm tính.' },
      { week: 'Tuần 3', title: 'Làm mini project', text: 'Hoàn thiện một form hoặc API nhỏ có validation, báo lỗi và lưu dữ liệu.' },
      { week: 'Tuần 4', title: 'Review với người khác', text: 'Nhờ bạn hoặc mentor test, sau đó sửa theo feedback và ghi lại quyết định.' },
    ],
    business: [
      { week: 'Tuần 1', title: 'Luyện ưu tiên vấn đề', text: 'Mỗi case kinh doanh ghi rõ nguyên nhân, ảnh hưởng và việc cần làm đầu tiên.' },
      { week: 'Tuần 2', title: 'Đọc chỉ số cơ bản', text: 'Theo dõi doanh số, chi phí, khách phàn nàn và chuyển chúng thành quyết định.' },
      { week: 'Tuần 3', title: 'Tập xử lý khách hàng', text: 'Viết 3 kịch bản phản hồi khi khách phàn nàn, ép giá hoặc dọa hủy hợp đồng.' },
      { week: 'Tuần 4', title: 'Mô phỏng họp vận hành', text: 'Trình bày một kế hoạch ngắn: mục tiêu, nguồn lực, rủi ro và cách đo kết quả.' },
    ],
    architecture: [
      { week: 'Tuần 1', title: 'Rèn bố trí công năng', text: 'Vẽ lại 3 mặt bằng nhỏ, giải thích vì sao đặt phòng ở vị trí đó.' },
      { week: 'Tuần 2', title: 'Đọc yêu cầu khách', text: 'Tách yêu cầu thành: bắt buộc, nên có, có thể bỏ khi thiếu ngân sách.' },
      { week: 'Tuần 3', title: 'Cân bằng đẹp và dùng được', text: 'So sánh một phương án đẹp với một phương án dễ thi công, ghi trade-off.' },
      { week: 'Tuần 4', title: 'Trình bày bản vẽ', text: 'Tập giải thích phương án trong 2 phút cho khách không chuyên môn.' },
    ],
    pharmacy: [
      { week: 'Tuần 1', title: 'Luyện hỏi thông tin an toàn', text: 'Tập hỏi triệu chứng, thời gian, dị ứng, thuốc đang dùng và dấu hiệu nguy hiểm.' },
      { week: 'Tuần 2', title: 'Phân loại tình huống', text: 'Chia ca thành: tư vấn được, cần hỏi thêm, nên khuyên đi khám.' },
      { week: 'Tuần 3', title: 'Giao tiếp với khách khó tính', text: 'Tập giải thích ngắn gọn vì sao cần hỏi thêm mà không làm khách khó chịu.' },
      { week: 'Tuần 4', title: 'Ôn giới hạn chuyên môn', text: 'Ghi lại những trường hợp không nên tự tư vấn tại quầy.' },
    ],
    marketing: [
      { week: 'Tuần 1', title: 'Xác định tệp khách', text: 'Mỗi chiến dịch phải có chân dung khách hàng, nỗi đau và lý do mua.' },
      { week: 'Tuần 2', title: 'Luyện thông điệp', text: 'Viết 5 hook khác nhau và dự đoán hook nào tạo chuyển đổi tốt hơn.' },
      { week: 'Tuần 3', title: 'Đọc số liệu campaign', text: 'Theo dõi CTR, conversion, CPA; nêu quyết định tối ưu từ dữ liệu.' },
      { week: 'Tuần 4', title: 'Làm campaign nhỏ', text: 'Thiết kế một chiến dịch 7 ngày có ngân sách, kênh, nội dung và chỉ số đo.' },
    ],
    accounting: [
      { week: 'Tuần 1', title: 'Rèn chứng từ', text: 'Tập phân loại hóa đơn, phiếu chi, hợp đồng và giao dịch thiếu thông tin.' },
      { week: 'Tuần 2', title: 'Nhìn dòng tiền', text: 'Lập bảng thu chi đơn giản, đánh dấu khoản cần trả trước và khoản có thể giãn.' },
      { week: 'Tuần 3', title: 'Kiểm tra số bất thường', text: 'Tìm các khoản lệch, trùng, thiếu chứng từ hoặc vượt ngân sách.' },
      { week: 'Tuần 4', title: 'Báo cáo cho quản lý', text: 'Tập nói ngắn: số nào lệch, rủi ro gì, cần quyết định gì.' },
    ],
    ecommerce: [
      { week: 'Tuần 1', title: 'Tối ưu gian hàng', text: 'Kiểm tra tiêu đề, ảnh, mô tả, giá, voucher và đánh giá khách hàng.' },
      { week: 'Tuần 2', title: 'Xử lý đơn và khách', text: 'Tập phản hồi khi giao sai hàng, chậm vận chuyển hoặc khách đánh giá thấp.' },
      { week: 'Tuần 3', title: 'Đọc chỉ số sàn', text: 'Theo dõi traffic, conversion, tồn kho, tỉ lệ hủy đơn và đưa ra quyết định.' },
      { week: 'Tuần 4', title: 'Chạy flash sale giả lập', text: 'Lập kế hoạch tồn kho, CSKH, vận chuyển và phương án khi đơn tăng đột biến.' },
    ],
    uiux: [
      { week: 'Tuần 1', title: 'Tìm lỗi trải nghiệm', text: 'Mỗi ngày chọn một màn hình app và ghi 3 lỗi làm người dùng khó thao tác.' },
      { week: 'Tuần 2', title: 'Ưu tiên sửa UX', text: 'Xếp lỗi theo ảnh hưởng: không hoàn thành được, mất thời gian, khó hiểu, kém đẹp.' },
      { week: 'Tuần 3', title: 'Vẽ lại flow', text: 'Thiết kế một màn hình trước/sau và giải thích vì sao bản sau dễ dùng hơn.' },
      { week: 'Tuần 4', title: 'Bảo vệ thiết kế', text: 'Trình bày quyết định thiết kế bằng mục tiêu người dùng, không chỉ bằng gu cá nhân.' },
    ],
  };

  const base = specific[careerId] || specific.business;
  if (!improvements[0]) return base;
  return base.map((item, index) => index === 0
    ? { ...item, text: `${item.text} Ưu tiên sửa: ${improvements[0]}` }
    : item,
  ).map((item, index) => index === 1
    ? { ...item, text: `${item.text} Theo radar, cần chú ý thêm nhóm ${weakestLabel.toLowerCase()}.` }
    : item,
  );
}

function makeFreeSummary(name: string, matchPercent: number, topCareer: string, strongest: string, weakest: string) {
  if (matchPercent >= 80) {
    return `${name}, cậu có tín hiệu khá tốt với ${topCareer}. Điểm sáng là ${strongest.toLowerCase()}, nhưng vẫn nên rèn thêm ${weakest.toLowerCase()} trước khi kết luận chắc chắn.`;
  }

  if (matchPercent >= 60) {
    return `${name}, cậu có tiềm năng với ${topCareer}, nhưng chưa phải kiểu “chắc kèo”. Điểm nên xem kỹ hơn là ${weakest.toLowerCase()}.`;
  }

  if (matchPercent >= 40) {
    return `${name}, kết quả đang ở mức cần trải nghiệm thêm. Có vài tín hiệu tốt, nhưng dữ liệu chưa đủ mạnh để nói cậu thật sự hợp ${topCareer}.`;
  }

  return `${name}, phiên này chưa đủ tốt để kết luận phù hợp với ${topCareer}. Cậu nên làm lại nghiêm túc hơn để hệ thống có dữ liệu rõ ràng.`;
}

function printParentReport(playerProfile: PlayerProfile, report: DerivedReport) {
  const html = `
    <!doctype html>
    <html lang="vi">
      <head>
        <meta charset="utf-8" />
        <title>Career Quest AI - Parent-Proof Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 36px; color: #111827; line-height: 1.6; }
          h1 { color: #4c1d95; margin-bottom: 6px; }
          h2 { color: #1e3a8a; margin-top: 28px; }
          .box { border: 2px solid #4c1d95; padding: 16px; margin: 16px 0; }
          .score { font-size: 48px; font-weight: 900; color: #7c3aed; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th, td { border: 1px solid #d1d5db; padding: 10px; text-align: left; }
          th { background: #ede9fe; }
          .note { font-size: 13px; color: #4b5563; margin-top: 24px; }
        </style>
      </head>
      <body>
        <h1>CAREER QUEST AI</h1>
        <p><strong>Parent-Proof Report</strong> - Báo cáo định hướng dành cho phụ huynh</p>

        <div class="box">
          <p><strong>Họ tên:</strong> ${escapeHtml(playerProfile.fullName)}</p>
          <p><strong>Email:</strong> ${escapeHtml(playerProfile.email)}</p>
          <p><strong>Vai trò tham khảo:</strong> ${escapeHtml(report.topCareer)}</p>
          <p class="score">${report.matchPercent}%</p>
        </div>

        <h2>Tóm tắt dễ hiểu</h2>
        <p>${escapeHtml(report.parentSummary)}</p>

        <h2>Radar 5 nhóm năng lực</h2>
        <table>
          <thead><tr><th>Nhóm năng lực</th><th>Điểm</th></tr></thead>
          <tbody>
            ${report.radarMetrics.map((metric) => `<tr><td>${escapeHtml(metric.label)}</td><td>${metric.value}/100</td></tr>`).join('')}
          </tbody>
        </table>

        <h2>Lộ trình 4 tuần</h2>
        <table>
          <tbody>
            ${report.roadmap.map((item) => `<tr><th>${escapeHtml(item.week)}</th><td><strong>${escapeHtml(item.title)}</strong><br/>${escapeHtml(item.text)}</td></tr>`).join('')}
          </tbody>
        </table>

        <p class="note">Lưu ý: Báo cáo này mang tính định hướng, không phải kết luận tuyệt đối về nghề nghiệp. Gia đình nên kết hợp thêm trải nghiệm học tập, tư vấn từ thầy cô và thông tin thực tế của ngành.</p>
      </body>
    </html>
  `;

  const reportWindow = window.open('', '_blank', 'width=900,height=720');
  if (!reportWindow) {
    window.print();
    return;
  }

  reportWindow.document.open();
  reportWindow.document.write(html);
  reportWindow.document.close();
  reportWindow.focus();
  reportWindow.print();
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
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
