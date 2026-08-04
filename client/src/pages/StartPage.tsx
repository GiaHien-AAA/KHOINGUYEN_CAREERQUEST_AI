import { motion } from 'motion/react';

interface StartPageProps {
  onOpenLogin: () => void;
  onOpenRegister: () => void;
}

export function StartPage({ onOpenLogin, onOpenRegister }: StartPageProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070a17] px-4 py-6 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_8%,rgba(139,233,253,0.18),transparent_34%),linear-gradient(180deg,#10162f_0%,#070a17_100%)]" />
      <div className="pointer-events-none fixed inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:32px_32px]" />

      <motion.section
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-7xl items-center gap-6 lg:grid-cols-[0.82fr_1.18fr]"
      >
        <div className="order-2 text-center lg:order-1 lg:text-left">
          <p className="text-[10px] font-black tracking-[0.42em] text-[#8be9fd] sm:text-xs">
            PRODUCED BY S.T.A.R LABS
          </p>

          <h1 className="mt-4 text-5xl font-black leading-[0.92] text-[#ffe066] drop-shadow-[5px_5px_0_#7c3aed] sm:text-7xl lg:text-8xl">
            CAREER<br />QUEST AI
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base font-bold leading-7 text-[#c4c8e8] lg:mx-0 sm:text-lg">
            Vào ca làm thử, xử lý tình huống công sở, và trải nghiệm các ngành nghề khác nhau trong thế giới pixel. Hãy thử sức với các thử thách và xem bạn có thể tiến xa đến đâu!
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <motion.button
              type="button"
              onClick={onOpenRegister}
              whileHover={{ scale: 1.04, y: -3 }}
              whileTap={{ scale: 0.96 }}
              className="border-4 border-[#ffe066] bg-[#7c3aed] px-7 py-4 text-lg font-black text-white shadow-[7px_7px_0_#000] transition hover:bg-[#9333ea] sm:text-xl"
            >
              TẠO TÀI KHOẢN
            </motion.button>

            <motion.button
              type="button"
              onClick={onOpenLogin}
              whileHover={{ scale: 1.04, y: -3 }}
              whileTap={{ scale: 0.96 }}
              className="border-4 border-[#8be9fd] bg-[#11162f] px-7 py-4 text-lg font-black text-[#dffbff] shadow-[7px_7px_0_#000] transition hover:bg-[#181d3a] sm:text-xl"
            >
              ĐĂNG NHẬP
            </motion.button>
          </div>

          <div className="mt-5 grid max-w-xl grid-cols-3 gap-2 text-center text-[10px] font-black uppercase tracking-[0.12em] text-[#c4c8e8] lg:mx-0">
            <MiniChip text="4 ngành free" />
            <MiniChip text="Roleplay AI" />
            <MiniChip text="Report" />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.12, duration: 0.5 }}
          className="order-1 lg:order-2"
        >
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0f1430]/90 p-3 shadow-2xl backdrop-blur sm:p-4">
            <div className="absolute left-5 top-5 z-10 rounded-full border border-[#070a17] bg-[#ffe066] px-3 py-1 text-[10px] font-black tracking-[0.22em] text-[#070a17] shadow-[4px_4px_0_#000]">
              CAREER CAST
            </div>
            <img
              src="/characters/cast-lineup.png"
              alt="Dàn nhân vật công sở Career Quest AI"
              className="h-auto w-full pixelated"
              draggable={false}
            />
          </div>
        </motion.div>
      </motion.section>

      <CrtOverlay />
    </main>
  );
}

function MiniChip({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-2 py-2 shadow-[3px_3px_0_#050816]">
      {text}
    </div>
  );
}

function CrtOverlay() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 opacity-[0.04]"
      style={{
        backgroundImage:
          'repeating-linear-gradient(to bottom, transparent 0px, transparent 3px, #000 4px)',
      }}
    />
  );
}
