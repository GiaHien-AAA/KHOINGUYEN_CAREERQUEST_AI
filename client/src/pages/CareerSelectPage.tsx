import { motion } from 'motion/react';

import type { PlayerProfile } from './PlayerProfilePage';
import {
  careerCatalog,
  formatVnd,
  type CareerCatalogItem,
  type CareerId,
} from '../game/careerCatalog';

interface CareerSelectPageProps {
  playerProfile: PlayerProfile;
  unlockedCareerIds: CareerId[];
  onBack: () => void;
  onOpenDashboard: () => void;
  onSelectCareer: (careerId: CareerId) => void;
  onBuyCareer: (careerId: CareerId) => void;
}

export function CareerSelectPage({
  playerProfile,
  unlockedCareerIds,
  onBack,
  onOpenDashboard,
  onSelectCareer,
  onBuyCareer,
}: CareerSelectPageProps) {
  const freeCareers = careerCatalog.filter((career) => career.isFree);
  const paidCareers = careerCatalog.filter((career) => !career.isFree);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0d1024] px-4 py-6 text-white sm:px-6 sm:py-8">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(255,224,102,0.12),transparent_34%),radial-gradient(circle_at_15%_80%,rgba(124,58,237,0.20),transparent_35%)]" />

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-3 border-4 border-[#4d568c] bg-[#11162f]/95 p-4 shadow-[6px_6px_0_#050816]">
          <div>
            <p className="text-[10px] font-black tracking-[0.3em] text-[#8be9fd]">PLAYER</p>
            <h2 className="mt-1 text-xl font-black text-[#ffe066]">{playerProfile.fullName}</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={onOpenDashboard} className="border-4 border-[#ffe066] bg-[#3b2f17] px-4 py-2 text-sm font-black text-[#ffe066] shadow-[4px_4px_0_#050816]">
              Dashboard
            </button>
            <button type="button" onClick={onBack} className="border-4 border-[#ff5c7a] bg-[#3a1626] px-4 py-2 text-sm font-black text-[#ffd6de] shadow-[4px_4px_0_#050816]">
              Đăng xuất
            </button>
          </div>
        </header>

        <section className="mt-8 grid items-center gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div>
            <p className="text-[10px] font-black tracking-[0.4em] text-[#8be9fd]">CAREER MAP</p>
            <h1 className="mt-3 text-4xl font-black text-[#ffe066] drop-shadow-[4px_4px_0_#7c3aed] sm:text-6xl">
              Chọn ngành để thử
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#c4c8e8] sm:text-base">
              4 ngành đầu miễn phí. Các ngành khóa có thể mở bằng trang thanh toán 15.000 VNĐ/ngành.
            </p>
          </div>

          <img
            src="/characters/cast-lineup.png"
            alt="Dàn NPC"
            className="hidden w-full rounded-2xl border-4 border-[#4d568c] bg-[#11162f] p-2 pixelated shadow-[7px_7px_0_#050816] lg:block"
            draggable={false}
          />
        </section>

        <CareerSection
          title="Ngành miễn phí"
          subtitle="Vào chơi ngay"
          careers={freeCareers}
          unlockedCareerIds={unlockedCareerIds}
          onSelectCareer={onSelectCareer}
          onBuyCareer={onBuyCareer}
        />

        <CareerSection
          title="Ngành mở khóa"
          subtitle="15.000 VNĐ/ngành"
          careers={paidCareers}
          unlockedCareerIds={unlockedCareerIds}
          onSelectCareer={onSelectCareer}
          onBuyCareer={onBuyCareer}
        />
      </div>

      <CrtOverlay />
    </main>
  );
}

function CareerSection({
  title,
  subtitle,
  careers,
  unlockedCareerIds,
  onSelectCareer,
  onBuyCareer,
}: {
  title: string;
  subtitle: string;
  careers: CareerCatalogItem[];
  unlockedCareerIds: CareerId[];
  onSelectCareer: (careerId: CareerId) => void;
  onBuyCareer: (careerId: CareerId) => void;
}) {
  return (
    <section className="mt-8">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-2xl font-black text-[#ffe066]">{title}</h2>
          <p className="mt-1 text-sm font-bold text-[#8be9fd]">{subtitle}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {careers.map((career, index) => {
          const unlocked = career.isFree || unlockedCareerIds.includes(career.id);
          return (
            <motion.article
              key={career.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="min-h-[210px] border-4 border-[#4d568c] bg-[#181d3a] p-5 shadow-[6px_6px_0_#050816]"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-5xl">{career.icon}</p>
                <span className={`border-2 px-2 py-1 text-[10px] font-black ${unlocked ? 'border-[#63e6a8] text-[#63e6a8]' : 'border-[#ffb84d] text-[#ffb84d]'}`}>
                  {unlocked ? 'OPEN' : career.tag}
                </span>
              </div>

              <h3 className="mt-5 text-xl font-black text-[#ffe066]">{career.title}</h3>
              <p className="mt-3 min-h-[48px] text-sm font-bold leading-6 text-[#d6d9ff]">{career.line}</p>

              <button
                type="button"
                onClick={() => unlocked ? onSelectCareer(career.id) : onBuyCareer(career.id)}
                className={`mt-5 w-full border-4 px-4 py-3 font-black shadow-[4px_4px_0_#050816] ${unlocked ? 'border-[#ffe066] bg-[#7c3aed] text-white' : 'border-[#ffb84d] bg-[#3a2816] text-[#ffe0b3]'}`}
              >
                {unlocked ? 'BẮT ĐẦU' : `MỞ KHÓA ${formatVnd(career.price)}`}
              </button>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}

function CrtOverlay() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 opacity-[0.05]"
      style={{ backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0px, transparent 3px, #000 4px)' }}
    />
  );
}
