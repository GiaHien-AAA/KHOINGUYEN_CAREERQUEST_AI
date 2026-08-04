import { motion } from 'motion/react';

import type { HybridMissionResult } from '../game/hybridMissionTypes';
import type { PlayerProfile } from './PlayerProfilePage';
import {
  formatVnd,
  getCareerById,
  type CareerId,
} from '../game/careerCatalog';

export type CheckoutType = 'career-unlock' | 'premium-report';

interface CheckoutPageProps {
  checkoutType: CheckoutType;
  careerId: CareerId;
  playerProfile: PlayerProfile;
  missionResult?: HybridMissionResult | null;
  onBack: () => void;
  onPaymentSuccess: (payload: { checkoutType: CheckoutType; careerId: CareerId }) => void;
}

const PREMIUM_REPORT_PRICE = 20000;

export function CheckoutPage({
  checkoutType,
  careerId,
  playerProfile,
  missionResult,
  onBack,
  onPaymentSuccess,
}: CheckoutPageProps) {
  const career = getCareerById(careerId);

  if (!career) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0d1024] px-4 text-white">
        <section className="w-full max-w-xl border-4 border-[#ff5c7a] bg-[#11162f] p-6 text-center shadow-[8px_8px_0_#070a17]">
          <h1 className="text-2xl font-black text-[#ffd6de]">Không tìm thấy sản phẩm thanh toán</h1>
          <button type="button" onClick={onBack} className="mt-6 border-4 border-[#ffe066] bg-[#7c3aed] px-5 py-3 font-black">
            Quay lại
          </button>
        </section>
      </main>
    );
  }

  const isPremiumReport = checkoutType === 'premium-report';
  const amount = isPremiumReport ? PREMIUM_REPORT_PRICE : career.price;
  const title = isPremiumReport ? 'Mở khóa báo cáo chuyên sâu' : 'Mở khóa ngành';
  const productName = isPremiumReport ? `Báo cáo chuyên sâu · ${career.title}` : career.title;
  const productLine = isPremiumReport
    ? 'Xem đầy đủ radar năng lực, dẫn chứng từ phiên chơi, điểm cần sửa và lộ trình phát triển.'
    : career.line;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0d1024] px-4 py-6 text-white sm:px-6 sm:py-10">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,184,77,0.18),transparent_30%),radial-gradient(circle_at_80%_70%,rgba(124,58,237,0.22),transparent_36%)]" />

      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 mx-auto grid min-h-[calc(100vh-70px)] w-full max-w-5xl items-center gap-6 lg:grid-cols-[minmax(0,1fr)_320px]"
      >
        <div className="border-4 border-[#ffb84d] bg-[#11162f]/95 p-5 shadow-[8px_8px_0_#050816] sm:p-8">
          <p className="text-[10px] font-black tracking-[0.35em] text-[#ffb84d]">CHECKOUT</p>
          <h1 className="mt-3 text-3xl font-black text-[#ffe066] sm:text-5xl">{title}</h1>

          <div className="mt-6 border-4 border-[#4d568c] bg-[#181d3a] p-5 shadow-[5px_5px_0_#050816]">
            <div className="flex items-start gap-4">
              <p className="text-6xl">{isPremiumReport ? '📊' : career.icon}</p>
              <div>
                <h2 className="text-2xl font-black text-[#ffe066]">{productName}</h2>
                <p className="mt-2 text-sm leading-7 text-[#d6d9ff]">{productLine}</p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <InfoBox label="TÀI KHOẢN" value={playerProfile.email} />
            <InfoBox label="THANH TOÁN" value={formatVnd(amount)} />
          </div>

          <div className="mt-5 border-4 border-[#4d568c] bg-[#0f1430] p-5">
            <p className="font-black text-[#8be9fd]">Sau khi thanh toán</p>
            <div className="mt-3 grid gap-2 text-sm font-bold leading-6 text-[#d6dcff] sm:grid-cols-2">
              {isPremiumReport ? (
                <>
                  <p>✓ Xem báo cáo chuyên sâu ngay</p>
                  <p>✓ Lưu quyền xem lại trong Dashboard</p>
                  <p>✓ Chơi lại ngành này không cần mua lại</p>
                  <p>✓ Có thể xuất bản tóm tắt cho phụ huynh</p>
                </>
              ) : (
                <>
                  <p>✓ Chơi ngành này trên tài khoản</p>
                  <p>✓ Lưu tiến trình trải nghiệm</p>
                  <p>✓ Tạo báo cáo ngành đã chơi</p>
                  <p>✓ Quay lại xem sau</p>
                </>
              )}
            </div>
          </div>

          {isPremiumReport && missionResult && (
            <div className="mt-5 rounded-3xl border border-[#63e6a8]/40 bg-[#63e6a8]/10 p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#63e6a8]">Báo cáo đang mua</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#dbe4ff]">
                Điểm phiên chơi hiện tại: <strong>{Math.round(missionResult.analysis.overallScore || missionResult.score)}/100</strong> · {missionResult.analysis.careerFit}
              </p>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={onBack} className="border-4 border-[#7c83a8] bg-[#282d50] px-5 py-4 font-black shadow-[5px_5px_0_#050816]">
              ◀ Quay lại
            </button>
            <button
              type="button"
              onClick={() => onPaymentSuccess({ checkoutType, careerId })}
              className="pixel-button flex-1 px-6 py-4 text-base sm:text-lg"
            >
TÔI ĐÃ THANH TOÁN
            </button>
          </div>
        </div>

        <aside className="border-4 border-[#4d568c] bg-[#11162f]/95 p-5 text-center shadow-[8px_8px_0_#050816]">
          <p className="text-[10px] font-black tracking-[0.25em] text-[#8be9fd]">QR THANH TOÁN</p>
          <div className="mx-auto mt-4 grid h-48 w-48 grid-cols-6 gap-1 border-4 border-[#ffe066] bg-[#fff8f0] p-3 shadow-[5px_5px_0_#050816]">
            {Array.from({ length: 36 }).map((_, index) => (
              <span key={index} className={index % 2 === 0 || index % 7 === 0 ? 'bg-[#111827]' : 'bg-[#fff8f0]'} />
            ))}
          </div>
          <p className="mt-4 text-sm leading-7 text-[#c4c8e8]">
            Quét QR hoặc bấm xác nhận để hoàn tất thanh toán và mở quyền trên tài khoản.
          </p>
        </aside>
      </motion.section>

      <CrtOverlay />
    </main>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-4 border-[#4d568c] bg-[#181d3a] p-4 shadow-[4px_4px_0_#050816]">
      <p className="text-[10px] font-black tracking-[0.2em] text-[#8be9fd]">{label}</p>
      <p className="mt-2 break-words font-black text-[#ffe066]">{value}</p>
    </div>
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
