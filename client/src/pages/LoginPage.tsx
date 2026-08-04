import { useState, type FormEvent, type ReactNode } from 'react';
import { motion } from 'motion/react';

import { loginAccount } from '../services/accountStore';
import type { PlayerProfile } from './PlayerProfilePage';

interface LoginPageProps {
  onBack: () => void;
  onGoRegister: () => void;
  onLoginSuccess: (profile: PlayerProfile) => void;
}

export function LoginPage({ onBack, onGoRegister, onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanEmail = email.trim().toLowerCase();
    const validationError = validateLogin(cleanEmail, password);

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setIsSubmitting(true);
    const result = await loginAccount({
      email: cleanEmail,
      password,
    });
    setIsSubmitting(false);

    if (!result.ok) {
      setErrorMessage(result.message);
      return;
    }

    onLoginSuccess({
      userId: result.account.id,
      fullName: result.account.fullName,
      email: result.account.email,
      userType: result.account.userType,
      gender: result.account.gender,
    });
  }

  return (
    <AuthShell
      title="Đăng nhập"
      subtitle="Hãy đăng nhâp để tiếp tục hành trình của bạn trong Career Quest AI."
      character="/characters/mentor-nova/neutral.png"
      characterAlt="Mentor Nova"
      onBack={onBack}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="EMAIL" value={email} type="email" placeholder="player@gmail.com" onChange={(value) => { setEmail(value); setErrorMessage(''); }} />
        <FormField label="MẬT KHẨU" value={password} type="password" placeholder="Nhập mật khẩu" onChange={(value) => { setPassword(value); setErrorMessage(''); }} />

        {errorMessage && <ErrorMessage text={errorMessage} />}

        <button type="submit" disabled={isSubmitting} className="pixel-button w-full px-6 py-4 text-base sm:text-lg disabled:cursor-not-allowed disabled:opacity-60">
          {isSubmitting ? 'ĐANG KIỂM TRA...' : 'ĐĂNG NHẬP ▶'}
        </button>

        <button type="button" onClick={onGoRegister} className="w-full rounded-2xl border border-[#8be9fd]/40 bg-[#8be9fd]/10 px-5 py-3 text-sm font-black text-[#cfffff] transition hover:bg-[#8be9fd]/15">
          Chưa có tài khoản? Đăng ký
        </button>
      </form>
    </AuthShell>
  );
}

function validateLogin(email: string, password: string) {
  if (!/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(email) || email.includes('..')) return 'Email chưa đúng định dạng.';
  if (password.length < 6) return 'Mật khẩu cần tối thiểu 6 ký tự.';
  return '';
}

interface AuthShellProps {
  title: string;
  subtitle: string;
  character: string;
  characterAlt: string;
  onBack: () => void;
  children: ReactNode;
}

function AuthShell({ title, subtitle, character, characterAlt, onBack, children }: AuthShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070a17] px-4 py-6 text-white sm:px-6 sm:py-10">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_24%_18%,rgba(139,233,253,0.16),transparent_30%),radial-gradient(circle_at_78%_72%,rgba(124,58,237,0.22),transparent_35%),linear-gradient(180deg,#10162f_0%,#070a17_100%)]" />
      <motion.section
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center gap-6 lg:grid-cols-[300px_minmax(0,1fr)]"
      >
        <aside className="hidden lg:block">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur">
            <img src={character} alt={characterAlt} className="mx-auto h-[360px] object-contain pixelated" draggable={false} />
          </div>
        </aside>

        <section className="rounded-[2rem] border border-white/10 bg-[#11162f]/92 p-5 shadow-2xl backdrop-blur sm:p-7">
          <button type="button" onClick={onBack} className="mb-5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black text-[#c4c8e8] transition hover:bg-white/10">
            ← TRANG START
          </button>
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#8be9fd]">ACCOUNT</p>
          <h1 className="mt-2 text-4xl font-black text-[#ffe066] sm:text-5xl">{title}</h1>
          <p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-[#c4c8e8]">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </section>
      </motion.section>
    </main>
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
    <p className="rounded-2xl border border-[#ff5c7a]/50 bg-[#38162b] px-4 py-3 text-sm font-bold text-[#ffd6de]">
      ⚠ {text}
    </p>
  );
}
