import {
  FREE_CAREER_IDS,
  type CareerId,
} from '../game/careerCatalog';
import { ApiError, apiPost } from './apiClient';

export type StoredUserType = 'student' | 'university' | 'worker';
export type StoredGender = 'male' | 'female' | 'other';

export interface StoredAccount {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  userType: StoredUserType;
  gender: StoredGender;
  unlockedCareerIds: CareerId[];
  createdAt: string;
  lastLoginAt: string;
}

interface RegisterAccountInput {
  fullName: string;
  email: string;
  password: string;
  userType: StoredUserType;
  gender: StoredGender;
}

interface LoginAccountInput {
  email: string;
  password: string;
}

interface BackendAuthResponse {
  token: string;
  account: {
    id: string;
    fullName: string;
    email: string;
    userType: StoredUserType;
    gender: StoredGender;
    unlockedCareerIds: CareerId[];
    createdAt: string;
    lastLoginAt: string;
  };
}

interface BackendUnlockResponse {
  careerId: CareerId;
  unlockedCareerIds: CareerId[];
}

interface LegacyAccount {
  id?: string;
  fullName?: string;
  email?: string;
  passwordHash?: string;
  userType?: StoredUserType;
  gender?: StoredGender;
  unlockedCareerIds?: CareerId[];
  createdAt?: string;
  lastLoginAt?: string;
}

const ACCOUNTS_KEY = 'careerQuest.accounts.v1';
const CURRENT_EMAIL_KEY = 'careerQuest.currentEmail.v1';
const AUTH_TOKEN_KEY = 'careerQuest.authToken.v1';

export async function createAccount(input: RegisterAccountInput) {
  try {
    const data = await apiPost<BackendAuthResponse>('/auth/register', input);
    const account = persistBackendSession(data);
    return {
      ok: true as const,
      account,
      isNewAccount: true,
      source: 'database' as const,
    };
  } catch (error) {
    if (isHardAuthError(error)) {
      return {
        ok: false as const,
        message: error.message,
      };
    }

    console.warn('[AUTH] Backend DB chưa sẵn sàng, dùng localStorage tạm:', error);
    return createLocalAccount(input);
  }
}

export async function loginAccount(input: LoginAccountInput) {
  try {
    const data = await apiPost<BackendAuthResponse>('/auth/login', input);
    const account = persistBackendSession(data);
    return {
      ok: true as const,
      account,
      isNewAccount: false,
      source: 'database' as const,
    };
  } catch (error) {
    if (isHardAuthError(error) && !hasLocalAccount(input.email)) {
      return {
        ok: false as const,
        message: error.message,
      };
    }

    console.warn('[AUTH] Backend DB chưa sẵn sàng hoặc tài khoản cũ chỉ có localStorage:', error);
    return loginLocalAccount(input);
  }
}

export async function registerOrLoginAccount(input: RegisterAccountInput) {
  const created = await createAccount(input);
  if (created.ok) return created;

  return loginAccount({
    email: input.email,
    password: input.password,
  });
}

export function getCurrentAccount() {
  const email = getCurrentEmail();
  if (!email) return null;
  return readAccounts().find((account) => account.email === email) || null;
}

export function getCurrentSessionProfile() {
  const account = getCurrentAccount();
  if (!account) return null;

  return {
    userId: account.id,
    fullName: account.fullName,
    email: account.email,
    userType: account.userType,
    gender: account.gender,
  };
}

export function getUnlockedCareerIds(email?: string): CareerId[] {
  const account = email
    ? readAccounts().find((item) => item.email === email.toLowerCase())
    : getCurrentAccount();

  if (!account) return [...FREE_CAREER_IDS];
  return uniqueCareerIds([...FREE_CAREER_IDS, ...(account.unlockedCareerIds || [])]);
}

export function unlockCareerForEmail(email: string, careerId: CareerId) {
  const updatedAccount = unlockCareerLocally(email, careerId);
  const token = getAuthToken();

  if (token) {
    void apiPost<BackendUnlockResponse>(`/careers/${careerId}/unlock`, { careerId }, token)
      .then((data) => {
        if (data?.unlockedCareerIds?.length) {
          replaceUnlockedCareers(email, data.unlockedCareerIds);
        }
      })
      .catch((error) => console.warn('[ACCOUNT] Không đồng bộ mở khóa ngành lên DB:', error));
  }

  return updatedAccount;
}

export function saveCurrentEmail(email: string) {
  setCurrentEmail(email.trim().toLowerCase());
}

export function getAuthToken() {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(AUTH_TOKEN_KEY) || '';
}

export function clearCurrentAccount() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(CURRENT_EMAIL_KEY);
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
}

function createLocalAccount(input: RegisterAccountInput) {
  const accounts = readAccounts();
  const fullName = input.fullName.trim();
  const email = input.email.trim().toLowerCase();
  const existing = accounts.find((account) => account.email === email);

  if (existing) {
    return {
      ok: false as const,
      message: 'Email này đã có tài khoản. Chuyển sang đăng nhập để tiếp tục.',
    };
  }

  const account: StoredAccount = {
    id: `user-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    fullName,
    email,
    passwordHash: hashPassword(input.password),
    userType: input.userType,
    gender: normalizeGender(input.gender),
    unlockedCareerIds: [...FREE_CAREER_IDS],
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  writeAccounts([...accounts, account]);
  setCurrentEmail(account.email);

  return {
    ok: true as const,
    account,
    isNewAccount: true,
    source: 'local' as const,
  };
}

function loginLocalAccount(input: LoginAccountInput) {
  const accounts = readAccounts();
  const email = input.email.trim().toLowerCase();
  const existing = accounts.find((account) => account.email === email);

  if (!existing) {
    return {
      ok: false as const,
      message: 'Không tìm thấy tài khoản với email này.',
    };
  }

  if (existing.passwordHash !== hashPassword(input.password)) {
    return {
      ok: false as const,
      message: 'Mật khẩu chưa đúng.',
    };
  }

  const updated: StoredAccount = {
    ...existing,
    gender: normalizeGender(existing.gender),
    userType: normalizeUserType(existing.userType),
    unlockedCareerIds: uniqueCareerIds([...FREE_CAREER_IDS, ...(existing.unlockedCareerIds || [])]),
    lastLoginAt: new Date().toISOString(),
  };

  writeAccounts(accounts.map((account) => account.id === updated.id ? updated : account));
  setCurrentEmail(updated.email);

  return {
    ok: true as const,
    account: updated,
    isNewAccount: false,
    source: 'local' as const,
  };
}

function persistBackendSession(data: BackendAuthResponse) {
  const account: StoredAccount = {
    id: data.account.id,
    fullName: data.account.fullName,
    email: data.account.email.trim().toLowerCase(),
    passwordHash: 'database-managed',
    userType: normalizeUserType(data.account.userType),
    gender: normalizeGender(data.account.gender),
    unlockedCareerIds: uniqueCareerIds(data.account.unlockedCareerIds || FREE_CAREER_IDS),
    createdAt: data.account.createdAt || new Date().toISOString(),
    lastLoginAt: data.account.lastLoginAt || new Date().toISOString(),
  };

  upsertAccount(account);
  setCurrentEmail(account.email);
  setAuthToken(data.token);
  return account;
}

function unlockCareerLocally(email: string, careerId: CareerId) {
  const accounts = readAccounts();
  const cleanEmail = email.trim().toLowerCase();
  let updatedAccount: StoredAccount | null = null;

  const nextAccounts = accounts.map((account) => {
    if (account.email !== cleanEmail) return account;
    updatedAccount = {
      ...account,
      gender: normalizeGender(account.gender),
      unlockedCareerIds: uniqueCareerIds([...(account.unlockedCareerIds || []), careerId]),
      lastLoginAt: new Date().toISOString(),
    };
    return updatedAccount;
  });

  writeAccounts(nextAccounts);
  return updatedAccount;
}

function replaceUnlockedCareers(email: string, unlockedCareerIds: CareerId[]) {
  const accounts = readAccounts();
  const cleanEmail = email.trim().toLowerCase();
  writeAccounts(accounts.map((account) => (
    account.email === cleanEmail
      ? { ...account, unlockedCareerIds: uniqueCareerIds(unlockedCareerIds), lastLoginAt: new Date().toISOString() }
      : account
  )));
}

function hasLocalAccount(email: string) {
  const cleanEmail = email.trim().toLowerCase();
  return readAccounts().some((account) => account.email === cleanEmail);
}

function upsertAccount(account: StoredAccount) {
  const accounts = readAccounts();
  const exists = accounts.some((item) => item.email === account.email);
  writeAccounts(exists
    ? accounts.map((item) => item.email === account.email ? account : item)
    : [...accounts, account]);
}

function readAccounts(): StoredAccount[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(normalizeAccount)
      .filter((account): account is StoredAccount => Boolean(account));
  } catch {
    return [];
  }
}

function writeAccounts(accounts: StoredAccount[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function normalizeAccount(value: LegacyAccount): StoredAccount | null {
  const fullName = String(value.fullName || '').trim();
  const email = String(value.email || '').trim().toLowerCase();
  const passwordHash = String(value.passwordHash || '').trim();

  if (!fullName || !email || !passwordHash) return null;

  return {
    id: String(value.id || `user-${email}`),
    fullName,
    email,
    passwordHash,
    userType: normalizeUserType(value.userType),
    gender: normalizeGender(value.gender),
    unlockedCareerIds: uniqueCareerIds([...FREE_CAREER_IDS, ...((value.unlockedCareerIds || []) as CareerId[])]),
    createdAt: String(value.createdAt || new Date().toISOString()),
    lastLoginAt: String(value.lastLoginAt || new Date().toISOString()),
  };
}

function setCurrentEmail(email: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CURRENT_EMAIL_KEY, email);
}

function setAuthToken(token: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
}

function getCurrentEmail() {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(CURRENT_EMAIL_KEY) || '';
}

function normalizeUserType(value: unknown): StoredUserType {
  if (value === 'student' || value === 'worker' || value === 'university') return value;
  return 'university';
}

function normalizeGender(value: unknown): StoredGender {
  if (value === 'male' || value === 'female' || value === 'other') return value;
  return 'other';
}

function uniqueCareerIds(careerIds: Array<CareerId | string>) {
  return Array.from(
    new Set(
      careerIds
        .map((careerId) => careerId === 'law' ? 'ecommerce' : careerId)
        .filter(isKnownCareerId),
    ),
  );
}

function isKnownCareerId(careerId: string): careerId is CareerId {
  return [
    'it',
    'business',
    'architecture',
    'pharmacy',
    'marketing',
    'accounting',
    'ecommerce',
    'uiux',
  ].includes(careerId);
}

function isHardAuthError(error: unknown): error is ApiError {
  return error instanceof ApiError && [400, 401, 409].includes(error.status);
}

function hashPassword(password: string) {
  // Fallback localStorage only. Database mode uses bcrypt on backend.
  return window.btoa(encodeURIComponent(`career-quest:${password}`));
}
