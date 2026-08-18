import { useEffect, useState } from 'react';

import { StartPage } from './pages/StartPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import type { PlayerProfile } from './pages/PlayerProfilePage';
import { CareerSelectPage } from './pages/CareerSelectPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { BossBriefingPage } from './pages/BossBriefingPage';
import { HybridMissionPage } from './pages/HybridMissionPage';
import { IndustryMiniGamePage } from './pages/IndustryMiniGamePage';
import { ResultPage } from './pages/ResultPage';
import { UserDashboardPage } from './pages/UserDashboardPage';
import type { HybridMissionResult } from './game/hybridMissionTypes';
import {
  getCareerById,
  isCareerUnlocked,
  type CareerId,
} from './game/careerCatalog';
import {
  clearCurrentAccount,
  getCurrentAccount,
  getUnlockedCareerIds,
  unlockCareerForEmail,
} from './services/accountStore';
import {
  hasPremiumReport,
  markCareerCompleted,
  markCareerStarted,
  unlockPremiumReport,
  type StoredCareerSession,
} from './services/progressStore';

type GameScreen =
  | 'start'
  | 'login'
  | 'register'
  | 'career'
  | 'dashboard'
  | 'checkout'
  | 'boss'
  | 'workspace'
  | 'mini-game'
  | 'result';

type CheckoutItem =
  | { type: 'career-unlock'; careerId: CareerId }
  | { type: 'premium-report'; careerId: CareerId };

function App() {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>(() => getCurrentAccount() ? 'career' : 'start');
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile | null>(null);
  const [selectedCareerId, setSelectedCareerId] = useState<CareerId | null>(null);
  const [checkoutItem, setCheckoutItem] = useState<CheckoutItem | null>(null);
  const [unlockedCareerIds, setUnlockedCareerIds] = useState<CareerId[]>(() => getUnlockedCareerIds());
  const [missionResult, setMissionResult] = useState<HybridMissionResult | null>(null);
  const [progressVersion, setProgressVersion] = useState(0);

  useEffect(() => {
    const account = getCurrentAccount();
    if (!account) return;
    setPlayerProfile({
      userId: account.id,
      fullName: account.fullName,
      email: account.email,
      userType: account.userType,
      gender: account.gender,
    });
    setUnlockedCareerIds(getUnlockedCareerIds(account.email));
  }, []);

  function refreshUnlocks(email?: string) {
    setUnlockedCareerIds(getUnlockedCareerIds(email || playerProfile?.email));
  }

  function refreshProgress() {
    setProgressVersion((current) => current + 1);
  }

  function completeAuth(profile: PlayerProfile) {
    setPlayerProfile(profile);
    setSelectedCareerId(null);
    setCheckoutItem(null);
    setMissionResult(null);
    refreshUnlocks(profile.email);
    setCurrentScreen('career');
  }

  function selectCareer(careerId: CareerId) {
    const career = getCareerById(careerId);
    if (!career) return;

    if (!isCareerUnlocked(careerId, unlockedCareerIds)) {
      setCheckoutItem({ type: 'career-unlock', careerId });
      setCurrentScreen('checkout');
      return;
    }

    if (playerProfile?.email) {
      markCareerStarted(playerProfile.email, careerId);
      refreshProgress();
    }

    setSelectedCareerId(careerId);
    setMissionResult(null);
    setCurrentScreen(career.gameMode === 'it-hybrid' ? 'boss' : 'mini-game');
  }

  function viewSavedReport(session: StoredCareerSession) {
    if (!session.result) return;
    setSelectedCareerId(session.careerId);
    setMissionResult(session.result);
    setCurrentScreen('result');
  }

  function resetToStart() {
    clearCurrentAccount();
    setPlayerProfile(null);
    setSelectedCareerId(null);
    setCheckoutItem(null);
    setMissionResult(null);
    setCurrentScreen('start');
  }

  if (currentScreen === 'start') {
    return (
      <StartPage
        onOpenLogin={() => setCurrentScreen('login')}
        onOpenRegister={() => setCurrentScreen('register')}
      />
    );
  }

  if (currentScreen === 'login') {
    return (
      <LoginPage
        onBack={() => setCurrentScreen('start')}
        onGoRegister={() => setCurrentScreen('register')}
        onLoginSuccess={completeAuth}
      />
    );
  }

  if (currentScreen === 'register') {
    return (
      <RegisterPage
        onBack={() => setCurrentScreen('start')}
        onGoLogin={() => setCurrentScreen('login')}
        onRegisterSuccess={completeAuth}
      />
    );
  }

  if (currentScreen === 'career' && playerProfile) {
    return (
      <CareerSelectPage
        playerProfile={playerProfile}
        unlockedCareerIds={unlockedCareerIds}
        onBack={resetToStart}
        onOpenDashboard={() => setCurrentScreen('dashboard')}
        onSelectCareer={selectCareer}
        onBuyCareer={(careerId) => {
          setCheckoutItem({ type: 'career-unlock', careerId });
          setCurrentScreen('checkout');
        }}
      />
    );
  }

  if (currentScreen === 'dashboard' && playerProfile) {
    return (
      <UserDashboardPage
        key={progressVersion}
        playerProfile={playerProfile}
        unlockedCareerIds={unlockedCareerIds}
        onBack={() => setCurrentScreen('career')}
        onLogout={resetToStart}
        onSelectCareer={selectCareer}
        onViewReport={viewSavedReport}
      />
    );
  }

  if (currentScreen === 'checkout' && playerProfile && checkoutItem) {
    return (
      <CheckoutPage
        checkoutType={checkoutItem.type}
        careerId={checkoutItem.careerId}
        playerProfile={playerProfile}
        missionResult={checkoutItem.type === 'premium-report' ? missionResult : null}
        onBack={() => setCurrentScreen(checkoutItem.type === 'premium-report' ? 'result' : 'career')}
        onPaymentSuccess={({ checkoutType, careerId }) => {
          if (checkoutType === 'premium-report') {
            unlockPremiumReport(playerProfile.email, careerId);
            setCheckoutItem(null);
            setSelectedCareerId(careerId);
            refreshProgress();
            setCurrentScreen('result');
            return;
          }

          unlockCareerForEmail(playerProfile.email, careerId);
          const nextUnlocked = getUnlockedCareerIds(playerProfile.email);
          setUnlockedCareerIds(nextUnlocked);
          markCareerStarted(playerProfile.email, careerId);
          setCheckoutItem(null);
          setSelectedCareerId(careerId);
          setMissionResult(null);
          refreshProgress();
          const career = getCareerById(careerId);
          setCurrentScreen(career?.gameMode === 'it-hybrid' ? 'boss' : 'mini-game');
        }}
      />
    );
  }

  if (
    currentScreen === 'boss' &&
    playerProfile &&
    selectedCareerId === 'it'
  ) {
    return (
      <BossBriefingPage
        playerProfile={playerProfile}
        onBack={() => setCurrentScreen('career')}
        onAcceptMission={() => {
          setMissionResult(null);
          setCurrentScreen('workspace');
        }}
      />
    );
  }

  if (
    currentScreen === 'workspace' &&
    playerProfile &&
    selectedCareerId === 'it'
  ) {
    return (
      <HybridMissionPage
        playerProfile={playerProfile}
        onBack={() => setCurrentScreen('boss')}
        onComplete={(result) => {
          markCareerCompleted(playerProfile.email, selectedCareerId, result);
          setMissionResult(result);
          refreshProgress();
          setCurrentScreen('result');
        }}
      />
    );
  }

  if (
    currentScreen === 'mini-game' &&
    playerProfile &&
    selectedCareerId &&
    selectedCareerId !== 'it'
  ) {
    return (
      <IndustryMiniGamePage
        careerId={selectedCareerId}
        playerProfile={playerProfile}
        onBack={() => setCurrentScreen('career')}
        onComplete={(result) => {
          markCareerCompleted(playerProfile.email, selectedCareerId, result);
          setMissionResult(result);
          refreshProgress();
          setCurrentScreen('result');
        }}
      />
    );
  }

  if (
    currentScreen === 'result' &&
    playerProfile &&
    selectedCareerId &&
    missionResult
  ) {
    const premiumUnlocked = hasPremiumReport(playerProfile.email, selectedCareerId);

    return (
      <ResultPage
        playerProfile={playerProfile}
        careerId={selectedCareerId}
        missionResult={missionResult}
        premiumUnlocked={premiumUnlocked}
        onReplayMission={() => {
          setMissionResult(null);
          setCurrentScreen(selectedCareerId === 'it' ? 'workspace' : 'mini-game');
        }}
        onBackToCareer={() => {
          setSelectedCareerId(null);
          setMissionResult(null);
          setCurrentScreen('career');
        }}
        onBuyPremiumReport={() => {
          setCheckoutItem({ type: 'premium-report', careerId: selectedCareerId });
          setCurrentScreen('checkout');
        }}
      />
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0d1024] px-4 text-white">
      <section className="w-full max-w-2xl rounded-[2rem] border border-[#ff5c7a]/40 bg-[#11162f] p-6 text-center shadow-2xl">
        <p className="text-6xl">🛠️</p>
        <h1 className="mt-5 text-2xl font-black text-[#ffe066]">GAME STATE ERROR</h1>
        <p className="mt-4 text-sm leading-7 text-[#c4c8e8]">
          Dữ liệu phiên chơi không đồng bộ. Hãy bắt đầu lại từ màn hình chính.
        </p>
        <button
          type="button"
          onClick={resetToStart}
          className="mt-6 w-full rounded-2xl border border-[#ffe066]/50 bg-[#7c3aed] px-6 py-4 font-black shadow-[6px_6px_0_#000]"
        >
          ↻ BẮT ĐẦU LẠI
        </button>
      </section>
    </main>
  );
}

export default App;
