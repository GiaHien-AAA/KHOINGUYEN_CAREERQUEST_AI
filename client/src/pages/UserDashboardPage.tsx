import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { motion } from 'motion/react';

import type { PlayerProfile } from './PlayerProfilePage';
import { careerCatalog, type CareerId } from '../game/careerCatalog';
import {
  fetchDashboardFromDatabase,
  getDashboardSnapshot,
  type DashboardSnapshot,
  type StoredCareerSession,
} from '../services/progressStore';

interface UserDashboardPageProps {
  playerProfile: PlayerProfile;
  unlockedCareerIds: CareerId[];
  onBack: () => void;
  onLogout: () => void;
  onSelectCareer: (careerId: CareerId) => void;
  onViewReport: (session: StoredCareerSession) => void;
}

export function UserDashboardPage({
  playerProfile,
  unlockedCareerIds,
  onBack,
  onLogout,
  onSelectCareer,
  onViewReport,
}: UserDashboardPageProps) {
  const localSnapshot = useMemo(() => getDashboardSnapshot(playerProfile.email), [playerProfile.email]);
  const [databaseSnapshot, setDatabaseSnapshot] = useState<(DashboardSnapshot & { unlockedCareerIds?: CareerId[] }) | null>(null);

  useEffect(() => {
    let active = true;
    void fetchDashboardFromDatabase(playerProfile.email).then((snapshot) => {
      if (active && snapshot) setDatabaseSnapshot(snapshot);
    });
    return () => {
      active = false;
    };
  }, [playerProfile.email]);

  const snapshot = databaseSnapshot || localSnapshot;
  const effectiveUnlockedCareerIds = databaseSnapshot?.unlockedCareerIds || unlockedCareerIds;
  const latestCompleted = snapshot.completedSessions.slice(0, 4);
  const activeSessions = snapshot.inProgressSessions.slice(0, 3);
  const unlockedCareers = careerCatalog.filter((career) => career.isFree || effectiveUnlockedCareerIds.includes(career.id));

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070b18] px-4 py-5 text-white sm:px-6 sm:py-7">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(139,233,253,0.14),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(255,224,102,0.10),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(124,58,237,0.20),transparent_42%)]" />

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/10 bg-[#10162f]/90 px-5 py-4 shadow-2xl backdrop-blur">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#8be9fd]">Dashboard</p>
            <h1 className="mt-1 text-2xl font-black text-[#fff8f0] sm:text-3xl">{playerProfile.fullName}</h1>
            <p className="mt-1 text-sm font-semibold text-[#9fa8d8]">{playerProfile.email}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onBack}
              className="rounded-full border border-white/15 bg-white/10 px-4 py-3 text-sm font-black text-[#dbe4ff] hover:bg-white/15"
            >
              Chọn ngành
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-full border border-[#ff5c7a]/40 bg-[#ff5c7a]/10 px-4 py-3 text-sm font-black text-[#ffd6de] hover:bg-[#ff5c7a]/15"
            >
              Đăng xuất
            </button>
          </div>
        </header>

        <section className="mt-5 grid gap-4 md:grid-cols-3">
          <MetricCard label="Ngành đã mở" value={`${unlockedCareers.length}/8`} note="Gồm ngành miễn phí và đã mua" />
          <MetricCard label="Đã hoàn thành" value={`${snapshot.completedSessions.length}`} note="Phiên trải nghiệm đã xong" />
          <MetricCard label="Báo cáo đã mua" value={`${snapshot.premiumReports.length}`} note="Premium report đã mở khóa" />
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5">
            <Panel title="Ngành của tôi" subtitle="Vào chơi hoặc chơi lại nhanh">
              <div className="grid gap-3 md:grid-cols-2">
                {unlockedCareers.map((career) => {
                  const latest = snapshot.sessions.find((session) => session.careerId === career.id);
                  return (
                    <CareerTile
                      key={career.id}
                      icon={career.icon}
                      title={career.title}
                      status={latest ? statusText(latest) : 'Chưa chơi'}
                      score={latest?.score}
                      onClick={() => onSelectCareer(career.id)}
                    />
                  );
                })}
              </div>
            </Panel>

            <Panel title="Báo cáo gần đây" subtitle="Kết quả đã lưu trong tài khoản">
              {latestCompleted.length > 0 ? (
                <div className="space-y-3">
                  {latestCompleted.map((session) => (
                    <ReportRow
                      key={session.sessionId}
                      session={session}
                      onView={() => onViewReport(session)}
                      onReplay={() => onSelectCareer(session.careerId)}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState text="Chưa có báo cáo. Hoàn thành một ngành để xem lại kết quả tại đây." />
              )}
            </Panel>
          </div>

          <aside className="space-y-5">
            <Panel title="Đang chơi dở" subtitle="Tiến trình đang lưu">
              {activeSessions.length > 0 ? (
                <div className="space-y-3">
                  {activeSessions.map((session) => (
                    <ProgressCard key={session.sessionId} session={session} onContinue={() => onSelectCareer(session.careerId)} />
                  ))}
                </div>
              ) : (
                <EmptyState text="Không có ngành đang chơi dở." />
              )}
            </Panel>

            <Panel title="Báo cáo đã mua" subtitle="Premium report">
              {snapshot.premiumReports.length > 0 ? (
                <div className="space-y-3">
                  {snapshot.premiumReports.slice(0, 3).map((session) => (
                    <PremiumReportCard key={session.sessionId} session={session} onView={() => onViewReport(session)} />
                  ))}
                </div>
              ) : (
                <EmptyState text="Chưa mở khóa premium report nào." />
              )}
            </Panel>
          </aside>
        </section>
      </div>
    </main>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-[#10162f]/90 p-5 shadow-2xl backdrop-blur">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-[#fff8f0]">{title}</h2>
          <p className="mt-1 text-sm font-semibold text-[#9fa8d8]">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function MetricCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-white/10 bg-[#10162f]/90 p-5 shadow-2xl backdrop-blur"
    >
      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#8be9fd]">{label}</p>
      <p className="mt-2 text-4xl font-black text-[#ffe066]">{value}</p>
      <p className="mt-2 text-sm font-semibold text-[#9fa8d8]">{note}</p>
    </motion.div>
  );
}

function CareerTile({ icon, title, status, score, onClick }: {
  icon: string;
  title: string;
  status: string;
  score?: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group rounded-3xl border border-white/10 bg-[#151b38] p-4 text-left transition hover:-translate-y-0.5 hover:border-[#ffe066]/60"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-4xl">{icon}</span>
        {typeof score === 'number' && score > 0 && (
          <span className="rounded-full bg-[#63e6a8]/15 px-3 py-1 text-xs font-black text-[#63e6a8]">{score}</span>
        )}
      </div>
      <p className="mt-4 text-lg font-black text-[#fff8f0]">{title}</p>
      <p className="mt-1 text-sm font-bold text-[#9fa8d8]">{status}</p>
      <p className="mt-4 text-sm font-black text-[#8be9fd] group-hover:text-[#ffe066]">Vào ngành →</p>
    </button>
  );
}

function ReportRow({ session, onView, onReplay }: { session: StoredCareerSession; onView: () => void; onReplay: () => void }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#151b38] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-lg font-black text-[#fff8f0]">{session.careerTitle}</p>
          <p className="mt-1 text-sm font-semibold text-[#9fa8d8]">{session.careerFit}</p>
        </div>
        <span className="rounded-full bg-[#ffe066]/15 px-3 py-1 text-sm font-black text-[#ffe066]">{session.score}/100</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {session.suitableRoles.slice(0, 3).map((role) => (
          <span key={role} className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold text-[#dbe4ff]">{role}</span>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-bold text-[#7f89bd]">{formatDate(session.completedAt || session.updatedAt)}</p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={!session.result}
            onClick={onView}
            className="rounded-full bg-[#ffe066]/15 px-3 py-2 text-xs font-black text-[#ffe066] hover:bg-[#ffe066]/25 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Xem báo cáo
          </button>
          <button type="button" onClick={onReplay} className="rounded-full bg-white/10 px-3 py-2 text-xs font-black text-[#8be9fd] hover:bg-white/15">
            Chơi lại
          </button>
        </div>
      </div>
    </div>
  );
}

function ProgressCard({ session, onContinue }: { session: StoredCareerSession; onContinue: () => void }) {
  return (
    <button type="button" onClick={onContinue} className="w-full rounded-3xl border border-white/10 bg-[#151b38] p-4 text-left transition hover:border-[#ffe066]/60">
      <p className="font-black text-[#fff8f0]">{session.careerTitle}</p>
      <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-[#ffe066]" style={{ width: `${session.progressPercent}%` }} />
      </div>
      <p className="mt-2 text-xs font-bold text-[#9fa8d8]">Đã bắt đầu · {formatDate(session.startedAt)}</p>
    </button>
  );
}

function PremiumReportCard({ session, onView }: { session: StoredCareerSession; onView: () => void }) {
  return (
    <div className="rounded-3xl border border-[#ffe066]/30 bg-[#ffe066]/10 p-4">
      <p className="font-black text-[#ffe066]">{session.careerTitle}</p>
      <p className="mt-1 text-sm font-semibold text-[#dbe4ff]">Đã mở khóa báo cáo chuyên sâu</p>
      <button
        type="button"
        disabled={!session.result}
        onClick={onView}
        className="mt-3 rounded-full bg-[#ffe066]/20 px-3 py-2 text-xs font-black text-[#ffe066] hover:bg-[#ffe066]/30 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Xem lại báo cáo
      </button>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.04] p-5 text-sm font-semibold leading-6 text-[#9fa8d8]">
      {text}
    </div>
  );
}

function statusText(session: StoredCareerSession) {
  if (session.status === 'completed') return `Đã hoàn thành · ${session.score}/100`;
  return 'Đang chơi dở';
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
  } catch {
    return 'vừa xong';
  }
}
