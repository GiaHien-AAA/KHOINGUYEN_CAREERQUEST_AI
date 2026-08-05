import { useState, type FormEvent } from 'react';
import { motion } from 'motion/react';

import {
  createAccount,
  type StoredGender,
  type StoredUserType,
} from '../services/accountStore';
import type { PlayerProfile, UserGender, UserType } from './PlayerProfilePage';

interface RegisterPageProps {
  onBack: () => void;
  onGoLogin: () => void;
  onRegisterSuccess: (profile: PlayerProfile) => void;
}

const userTypeOptions: Array<{
  value: UserType;
  icon: string;
  title: string;
}> = [
  { value: 'student', icon: '🎒', title: 'Học sinh' },
  { value: 'university', icon: '🎓', title: 'Sinh viên' },
  { value: 'worker', icon: '💼', title: 'Đi làm' },
];

const genderOptions: Array<{
  value: UserGender;
  title: string;
  hint: string;
}> = [
  { value: 'male', title: 'Nam', hint: '' },
  { value: 'female', title: 'Nữ', hint: '' },
  { value: 'other', title: 'Khác / không muốn nói', hint: 'Gọi bằng tên hoặc bạn.' },
];

export function RegisterPage({ onBack, onGoLogin, onRegisterSuccess }: RegisterPageProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<StoredUserType>('university');
  const [gender, setGender] = useState<StoredGender>('male');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const validationError = validateRegister(cleanName, cleanEmail, password);

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setIsSubmitting(true);
    const result = await createAccount({
      fullName: cleanName,
      email: cleanEmail,
      password,
      userType,
      gender,
    });
    setIsSubmitting(false);

    if (!result.ok) {
      setErrorMessage(result.message);
      return;
    }

    onRegisterSuccess({
      userId: result.account.id,
      fullName: result.account.fullName,
      email: result.account.email,
      userType: result.account.userType,
      gender: result.account.gender,
    });
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070a17] px-4 py-6 text-white sm:px-6 sm:py-10">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(139,233,253,0.16),transparent_30%),radial-gradient(circle_at_82%_72%,rgba(124,58,237,0.24),transparent_35%),linear-gradient(180deg,#10162f_0%,#070a17_100%)]" />

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-6 lg:grid-cols-[300px_minmax(0,1fr)]"
      >
        <aside className="hidden lg:block">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur">
            <img src="/characters/boss-byte/neutral.png" alt="Boss Byte" className="mx-auto h-[360px] object-contain pixelated" draggable={false} />
          </div>
        </aside>

        <section className="rounded-[2rem] border border-white/10 bg-[#11162f]/92 p-5 shadow-2xl backdrop-blur sm:p-7">
          <button type="button" onClick={onBack} className="mb-5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black text-[#c4c8e8] transition hover:bg-white/10">
            ← TRANG START
          </button>
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#8be9fd]">NEW PLAYER</p>
          <h1 className="mt-2 text-4xl font-black text-[#ffe066] sm:text-5xl">Đăng ký</h1>
          <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-[#c4c8e8]">
            Tạo tài khoản để bắt đầu hành trình của bạn trong Career Quest AI. Hãy điền thông tin bên dưới để đăng ký và trải nghiệm các thử thách thú vị trong thế giới pixel.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <FormField label="TÊN" value={fullName} placeholder="Nguyen Van A" type="text" onChange={(value) => { setFullName(value); setErrorMessage(''); }} />
            <FormField label="EMAIL" value={email} placeholder="player@gmail.com" type="email" onChange={(value) => { setEmail(value); setErrorMessage(''); }} />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <FormField label="MẬT KHẨU" value={password} placeholder="Tối thiểu 6 ký tự" type="password" onChange={(value) => { setPassword(value); setErrorMessage(''); }} />
            <GenderGroup selectedValue={gender} onSelect={(value) => setGender(value)} />
          </div>

          <div className="mt-5">
            <OptionGroup title="Bạn đang là" options={userTypeOptions} selectedValue={userType} onSelect={(value) => setUserType(value)} />
          </div>

          {errorMessage && <ErrorMessage text={errorMessage} />}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={onGoLogin} className="rounded-2xl border border-[#8be9fd]/40 bg-[#8be9fd]/10 px-5 py-4 text-sm font-black text-[#cfffff] transition hover:bg-[#8be9fd]/15">
              ĐÃ CÓ TÀI KHOẢN
            </button>
            <button type="submit" disabled={isSubmitting} className="pixel-button flex-1 px-6 py-4 text-base sm:text-lg disabled:cursor-not-allowed disabled:opacity-60">
              {isSubmitting ? 'ĐANG TẠO...' : 'TẠO TÀI KHOẢN ▶'}
            </button>
          </div>
        </section>
      </motion.form>
    </main>
  );
}

function OptionGroup({ title, options, selectedValue, onSelect }: {
  title: string;
  options: typeof userTypeOptions;
  selectedValue: UserType;
  onSelect: (value: UserType) => void;
}) {
  return (
    <section>
      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#8be9fd]">{title}</p>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {options.map((option) => {
          const selected = option.value === selectedValue;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelect(option.value)}
              className={`rounded-2xl border px-3 py-3 text-left transition ${selected ? 'border-[#ffe066] bg-[#7c3aed]' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
            >
              <span className="text-2xl">{option.icon}</span>
              <p className="mt-2 text-xs font-black text-[#fff8f0]">{option.title}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function GenderGroup({ selectedValue, onSelect }: {
  selectedValue: UserGender;
  onSelect: (value: UserGender) => void;
}) {
  return (
    <section>
      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#8be9fd]">Giới tính / xưng hô</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {genderOptions.map((option) => {
          const selected = option.value === selectedValue;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelect(option.value)}
              className={`min-w-[110px] flex-1 rounded-2xl border px-3 py-3 text-left transition ${selected ? 'border-[#ffe066] bg-[#7c3aed]' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
            >
              <p className="text-sm font-black text-[#fff8f0]">{option.title}</p>
              {option.hint ? <p className="mt-1 text-xs font-semibold text-[#c4c8e8]">{option.hint}</p> : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}

interface FormFieldProps {
  label: string;
  value: string;
  placeholder: string;
  type: 'text' | 'email' | 'password';
  onChange: (value: string) => void;
}

function FormField({ label, value, placeholder, type, onChange }: FormFieldProps) {
  return (
    <label className="block">
      <span className="text-[10px] font-black tracking-[0.24em] text-[#8be9fd]">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0c1025] px-4 py-3 text-base font-bold text-white outline-none placeholder:text-[#686e91] focus:border-[#ffe066]"
      />
    </label>
  );
}

function ErrorMessage({ text }: { text: string }) {
  return (
    <p className="mt-5 rounded-2xl border border-[#ff5c7a]/50 bg-[#38162b] px-4 py-3 text-sm font-bold text-[#ffd6de]">
      ⚠ {text}
    </p>
  );
}

function validateRegister(fullName: string, email: string, password: string) {
  if (fullName.length < 2) return 'Tên hơi ngắn. Nhập lại giúp tôi.';
  if (!/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(email) || email.includes('..')) return 'Email chưa đúng định dạng.';
  if (password.length < 6) return 'Mật khẩu cần tối thiểu 6 ký tự để lưu tài khoản.';
  return '';
}
