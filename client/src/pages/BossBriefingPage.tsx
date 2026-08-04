import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

import { CharacterPortrait } from '../components/CharacterPortrait';
import { PixelDialogBox } from '../components/PixelDialogBox';
import { PixelSceneBackground } from '../components/PixelSceneBackground';
import { getRoleplayActor } from '../game/roleplayScenarioData';
import type { PlayerProfile } from './PlayerProfilePage';

interface BossBriefingPageProps {
  playerProfile: PlayerProfile;
  onBack: () => void;
  onAcceptMission: () => void;
}

export function BossBriefingPage({
  playerProfile,
  onBack,
  onAcceptMission,
}: BossBriefingPageProps) {
  const boss = getRoleplayActor('boss-byte');
  const dialogues = getBossDialogues(playerProfile);
  const [dialogIndex, setDialogIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const currentDialog = dialogues[dialogIndex];
  const isLastDialog = dialogIndex === dialogues.length - 1;

  useEffect(() => {
    setDisplayedText('');
    setIsTyping(true);
    let characterIndex = 0;

    const timer = window.setInterval(() => {
      characterIndex += 1;
      setDisplayedText(currentDialog.slice(0, characterIndex));

      if (characterIndex >= currentDialog.length) {
        window.clearInterval(timer);
        setIsTyping(false);
      }
    }, 18);

    return () => window.clearInterval(timer);
  }, [currentDialog]);

  function advanceDialogue() {
    if (isTyping) {
      setDisplayedText(currentDialog);
      setIsTyping(false);
      return;
    }

    if (!isLastDialog) {
      setDialogIndex((current) => current + 1);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0d1024] px-3 py-5 text-white sm:px-6 sm:py-8">
      <PixelSceneBackground accent={boss.accent} scene="office" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-40px)] w-full max-w-7xl flex-col justify-between gap-4">
        <header className="flex flex-wrap items-center justify-between gap-3 border-4 border-[#4d568c] bg-[#11162f]/90 px-4 py-3 shadow-[6px_6px_0_#070a17]">
          <div>
            <p className="text-[10px] font-black tracking-[0.32em] text-[#8be9fd] sm:text-xs">
              PIXEL TECH CORP · DAY 01
            </p>
            <h1 className="mt-1 text-xl font-black text-[#ffe066] sm:text-2xl">
              NGÀY LÀM VIỆC ĐẦU TIÊN
            </h1>
          </div>
          <span className="border-2 border-[#63e6a8] bg-[#112a27] px-3 py-2 text-xs font-black text-[#63e6a8]">
            PLAYER: {playerProfile.fullName}
          </span>
        </header>

        <section className="grid flex-1 items-end gap-5 lg:grid-cols-[minmax(260px,420px)_minmax(0,1fr)]">
          <motion.aside
            initial={{ opacity: 0, x: -48 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 16 }}
            className="relative flex min-h-[390px] items-end justify-center overflow-visible"
          >
            <CharacterPortrait actor={boss} size="hero" mood={isLastDialog ? 'happy' : 'neutral'} isThinking={isTyping} />
          </motion.aside>

          <motion.section
            initial={{ opacity: 0, x: 48 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 16, delay: 0.08 }}
            className="pb-3"
          >
            <button type="button" onClick={advanceDialogue} className="w-full text-left">
              <PixelDialogBox
                actor={boss}
                eyebrow={`BOSS BYTE`}
                title="Boss Byte"
                text={displayedText}
                compact={false}
              />
            </button>

                        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onBack}
                className="border-4 border-[#7c83a8] bg-[#282d50] px-5 py-3 font-black shadow-[5px_5px_0_#070a17]"
              >
                ◀ QUAY LẠI
              </button>

              {!isTyping && isLastDialog ? (
                <button type="button" onClick={onAcceptMission} className="pixel-button flex-1 px-6 py-4 text-base sm:text-lg">
                  ⚔ VÀO TEAM
                </button>
              ) : (
                <button type="button" onClick={advanceDialogue} className="pixel-button flex-1 px-6 py-4 text-base sm:text-lg">
                  {isTyping ? 'HIỆN NHANH ▶' : 'TIẾP TỤC ▶'}
                </button>
              )}
            </div>
          </motion.section>
        </section>
      </div>
    </main>
  );
}

function getBossDialogues(playerProfile: PlayerProfile) {
  const address = getPlayerAddress(playerProfile);
  return [
    `Chào ${playerProfile.fullName}. Tôi là Boss Byte. Từ giờ coi như ${address} vừa vào team của tôi.`,
    'Ở đây không có câu trả lời mẫu đâu. Có task, có người chờ, có deadline và có lỗi xảy ra thật.',
    `Nếu sai, tôi sẽ nhắc thẳng. Nếu ổn, tôi cho qua. Quan trọng là ${address} sửa thế nào sau mỗi lần vấp.`,
    `Đi thôi. Task đầu tiên không khó, nhưng tôi muốn xem ${address} có biết sắp xếp vấn đề cho ra thứ tự không.`,
  ];
}

function getPlayerAddress(playerProfile: PlayerProfile) {
  if (playerProfile.gender === 'female') return 'em';
  if (playerProfile.gender === 'male') return playerProfile.userType === 'worker' ? 'anh' : 'cậu';
  return 'bạn';
}
