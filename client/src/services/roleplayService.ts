import type { PlayerProfile } from '../pages/PlayerProfilePage';
import {
  getRoleplayActor,
  getRoleplayScenario,
  type RoleplayActorId,
  type RoleplayStageId,
} from '../game/roleplayScenarioData';

export type RoleplayTone =
  | 'calm'
  | 'serious'
  | 'encouraging'
  | 'concerned'
  | 'challenging'
  | 'warning'
  | 'happy'
  | 'angry';

export interface RoleplayScenarioOverride {
  actorId?: RoleplayActorId;
  stageNumber?: number;
  missionTitle?: string;
  missionObjective?: string;
  context?: string;
  initialQuestion?: string;
  mode?: 'open' | 'code';
  maxConversationTurns?: number;
}

export interface RoleplayIntro {
  interactionId: string;
  stageId: RoleplayStageId;
  actorId: RoleplayActorId;
  actorName: string;
  actorRole: string;
  actorAvatar: string;
  missionTitle: string;
  missionObjective: string;
  message: string;
  question: string;
  tone: RoleplayTone;
  source: 'gemini' | 'mock' | 'mock-v3-office-dialogue' | 'demo-dialogue-v5' | 'frontend-fallback';
}

export interface RoleplayReply {
  interactionId: string;
  stageId: RoleplayStageId;
  actorId: RoleplayActorId;
  actorName: string;
  actorRole: string;
  actorAvatar: string;
  message: string;
  followUpQuestion: string;
  hint: string;
  shouldContinue: boolean;
  stageComplete: boolean;
  observation: string;
  tone: RoleplayTone;
  source: 'gemini' | 'mock' | 'mock-v3-office-dialogue' | 'demo-dialogue-v5' | 'frontend-fallback';
}

export type RoleplayEventType =
  | 'wrong_attempt'
  | 'success_attempt'
  | 'player_response'
  | 'follow_up_response';

export interface RoleplayTurnRequest {
  stageId: RoleplayStageId;
  playerProfile: PlayerProfile;
  scenarioOverride?: RoleplayScenarioOverride;
  previousInteractionId?: string;
  eventType: RoleplayEventType;
  playerMessage?: string;
  playerAction?: string[];
  attemptNumber?: number;
  turnNumber?: number;
  timeTaken?: number;
}

interface ApiSuccess<T> {
  success: true;
  data: T;
}

const API_BASE_URL = getApiBaseUrl();
const REQUEST_TIMEOUT_MS = 12000;
const introCache = new Map<string, Promise<RoleplayIntro>>();

export async function getRoleplayIntro(
  stageId: RoleplayStageId,
  playerProfile: PlayerProfile,
  scenarioOverride?: RoleplayScenarioOverride,
): Promise<RoleplayIntro> {
  const cacheKey = `${stageId}:${playerProfile.fullName}:${playerProfile.userType}:${playerProfile.gender}:${JSON.stringify(scenarioOverride || {})}`;
  const cached = introCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const request = (async () => {
    try {
      return await postJson<RoleplayIntro>('/api/roleplay/intro', {
        stageId,
        playerProfile,
        scenarioOverride,
      });
    } catch (error) {
      console.warn('[ROLEPLAY] Intro fallback activated.', error);
      return createFrontendIntroFallback(stageId, playerProfile, scenarioOverride);
    }
  })();

  introCache.set(cacheKey, request);

  // Giữ promise trong thời gian ngắn để React StrictMode không gọi API hai lần,
  // nhưng xóa sau đó để lần chơi lại có thể nhận lời giới thiệu AI mới.
  void request.finally(() => {
    window.setTimeout(() => {
      if (introCache.get(cacheKey) === request) {
        introCache.delete(cacheKey);
      }
    }, 1000);
  });

  return request;
}

export async function sendRoleplayTurn(
  request: RoleplayTurnRequest,
): Promise<RoleplayReply> {
  try {
    return await postJson<RoleplayReply>('/api/roleplay/turn', request);
  } catch (error) {
    console.warn('[ROLEPLAY] Turn fallback activated.', error);
    return createFrontendTurnFallback(request);
  }
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const payload = (await response.json()) as ApiSuccess<T> | {
      success: false;
      message?: string;
    };

    if (!response.ok || payload.success !== true) {
      throw new Error(
        'message' in payload && payload.message
          ? payload.message
          : `Roleplay API error: HTTP ${response.status}`,
      );
    }

    return payload.data;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function createFrontendIntroFallback(
  stageId: RoleplayStageId,
  playerProfile: PlayerProfile,
  scenarioOverride?: RoleplayScenarioOverride,
): RoleplayIntro {
  const scenario = getRoleplayScenario(stageId);

  if (!scenario) {
    throw new Error(`Không tìm thấy scenario ${stageId}.`);
  }

  const actor = getRoleplayActor(scenarioOverride?.actorId || scenario.actorId);
  const syncedMessage = buildSyncedFrontendIntro(scenarioOverride, getPlayerAddressName(playerProfile));

  return {
    interactionId: '',
    stageId,
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    actorAvatar: actor.avatar,
    missionTitle: scenarioOverride?.missionTitle || scenario.missionTitle,
    missionObjective: scenarioOverride?.missionObjective || scenario.missionObjective,
    message: syncedMessage || pickFrontendLine(actor.id, 'intro', `${stageId}-${playerProfile.fullName}`).replaceAll('{name}', getPlayerAddressName(playerProfile)),
    question: scenarioOverride?.initialQuestion || scenario.initialQuestion || '',
    tone: 'serious',
    source: 'frontend-fallback',
  };
}


function getPlayerAddressName(playerProfile: PlayerProfile) {
  if (playerProfile.gender === 'other') return playerProfile.fullName;
  return playerProfile.fullName;
}

function buildSyncedFrontendIntro(
  scenarioOverride: RoleplayScenarioOverride | undefined,
  playerName: string,
) {
  if (!scenarioOverride?.context) return '';

  const context = compactRoleplayText(scenarioOverride.context, 190);
  const objective = compactRoleplayText(
    scenarioOverride.initialQuestion || scenarioOverride.missionObjective || '',
    130,
  );

  return `${playerName}, ${context}${objective ? `
${objective}` : ''}`;
}

function compactRoleplayText(text: string, maxLength: number) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength - 1).trim()}…`;
}

function createFrontendTurnFallback(
  request: RoleplayTurnRequest,
): RoleplayReply {
  const scenario = getRoleplayScenario(request.stageId);

  if (!scenario) {
    throw new Error(`Không tìm thấy scenario ${request.stageId}.`);
  }

  const actor = getRoleplayActor(request.scenarioOverride?.actorId || scenario.actorId);
  const attempt = request.attemptNumber ?? 1;

  if (request.eventType === 'wrong_attempt') {
    return {
      interactionId: request.previousInteractionId ?? '',
      stageId: request.stageId,
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      actorAvatar: actor.avatar,
      message: pickFrontendLine(actor.id, attempt >= 2 ? 'wrongHot' : 'wrong', `${request.stageId}-${attempt}`),
      followUpQuestion: '',
      hint:
        attempt >= 3
          ? 'Hãy nghĩ theo chuỗi: có dữ liệu → xử lý → đưa ra kết quả.'
          : 'Tự hỏi: bước này có thể xảy ra khi bước trước chưa hoàn tất không?',
      shouldContinue: false,
      stageComplete: false,
      observation: 'Người chơi cần điều chỉnh trình tự xử lý.',
      tone: 'challenging',
      source: 'frontend-fallback',
    };
  }

  if (request.eventType === 'success_attempt') {
    return {
      interactionId: request.previousInteractionId ?? '',
      stageId: request.stageId,
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      actorAvatar: actor.avatar,
      message: pickFrontendLine(actor.id, 'success', `${request.stageId}-${attempt}`),
      followUpQuestion: '',
      hint: '',
      shouldContinue: false,
      stageComplete: true,
      observation: 'Người chơi hoàn thành đúng quy trình.',
      tone: 'encouraging',
      source: 'frontend-fallback',
    };
  }

  const isFirstTurn = (request.turnNumber ?? 1) <= 1;

  return {
    interactionId: request.previousInteractionId ?? '',
    stageId: request.stageId,
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    actorAvatar: actor.avatar,
    message: isFirstTurn
      ? pickFrontendLine(actor.id, 'react', `${request.stageId}-${request.playerMessage ?? ''}`)
      : pickFrontendLine(actor.id, 'complete', `${request.stageId}-${request.playerMessage ?? ''}`),
    followUpQuestion: isFirstTurn
      ? pickFrontendFollowUp(request.stageId, actor.id, request.playerMessage ?? '')
      : '',
    hint: '',
    shouldContinue: isFirstTurn,
    stageComplete: !isFirstTurn,
    observation: 'Người chơi đã mô tả cách xử lý tình huống.',
    tone: isFirstTurn ? 'challenging' : 'encouraging',
    source: 'frontend-fallback',
  };
}

const frontendDialogues: Record<string, Record<string, string[]>> = {
  'boss-byte': {
    intro: ['{name}, tôi là Boss Byte. Task đầu không khó, nhưng đừng kéo bừa như đang chơi xếp hình.', '{name}, welcome vào team. Tôi không cần cậu thần đồng, tôi cần cậu biết nghĩ trước khi bấm chạy.'],
    wrong: ['Khoan. Thứ tự này mà chạy thật thì lỗi nằm ngay từ bước đầu.', 'Chưa ổn. Cậu đang xử lý như người muốn qua màn, chưa giống người muốn giao sản phẩm chạy được.'],
    wrongHot: ['Tôi thấy cậu đang đoán nhiều hơn là suy nghĩ. Sửa lại trước khi task này kéo cả team xuống.', 'Task này chưa khó đâu. Nếu đoạn này còn rối thì lát nữa gặp bug thật cậu dễ hoảng lắm.'],
    success: ['Được, lần này ổn. Ít nhất tôi thấy cậu không kéo bừa nữa.', 'Tốt. Chưa cần màu mè, chạy đúng logic trước đã.'],
    react: ['Nghe được, nhưng còn hơi vòng vo. Deadline không ngồi chờ mình trình bày văn mẫu đâu.', 'Ý chính có rồi. Giờ nói gọn lại: trong 5 phút đầu cậu làm gì?'],
    complete: ['Rồi, tôi hiểu cách cậu xử lý hơn. Chưa hoàn hảo, nhưng có dấu hiệu biết bình tĩnh gỡ vấn đề.'],
  },
  'client-linh': {
    intro: ['Chào {name}, chị là Linh. Bên chị cần báo cáo để họp, nên chị cần kết quả chạy được, không cần nghe thuật ngữ khó.'],
    wrong: ['Chị nói thật nhé, cách này chưa dùng được. Nếu báo cáo vẫn sai thì bên chị không thể gửi đi được.'],
    wrongHot: ['Em đang làm chị hơi lo rồi đó. Dữ liệu nhiều dòng mà xử lý lệch là báo cáo đi tong.'],
    success: ['Rồi, vậy mới dùng được. Chị cần đúng kiểu nhanh, rõ, không bắt người ta làm tay từng dòng.'],
    react: ['Chị hiểu ý em, nhưng câu này vẫn hơi chung. Nếu lỗi thật xảy ra, em kiểm tra từ đâu trước?'],
    complete: ['Ổn. Chị chưa gọi là hoàn hảo, nhưng ít nhất chị biết em đang làm gì.'],
  },
  'qa-an': {
    intro: ['{name}, khoan bàn giao. Case này đỏ rồi. Nếu đưa lên demo, người dùng bấm một cái là lỗi lòi ra ngay.'],
    wrong: ['Case này fail rồi. Đừng cố thuyết phục tôi là nó ổn.', 'Tôi chưa cho qua. Có bước đang xử lý trước khi dữ liệu được kiểm tra.'],
    wrongHot: ['Khoan chạy tiếp. QA không khó tính cho vui đâu, lỗi này ra ngoài là khách thấy ngay.'],
    success: ['Ổn, lần này có kiểm tra trước rồi mới xử lý. QA đỡ phải tăng huyết áp.'],
    react: ['Tôi không cần niềm tin, tôi cần case kiểm thử. Cậu sẽ test case nào đầu tiên?'],
    complete: ['Được. Cậu bắt đầu nhìn vấn đề theo hướng phòng lỗi, không chỉ sửa lỗi.'],
  },
  'pm-trang': {
    intro: ['{name}, chị là Trang. Còn 30 phút nữa là bàn giao, chị cần quyết định ngay: cứu phần nào trước, phần nào để sau.'],
    react: ['Đừng ôm hết rồi cầu may. Việc nào cứu được bản demo thì làm trước.', 'Em đang nói như còn cả buổi. Thực tế là còn 30 phút, nên cắt cái gì trước?'],
    complete: ['Ổn. Chị cần kiểu trả lời như vậy: ngắn, có ưu tiên, có rủi ro, không hứa bừa.'],
  },
  'teammate-minh': {
    intro: ['Ê {name}, tớ là Minh. Phần giao diện của tớ đang kẹt vì chưa có logic của cậu. Mình chia lại việc đi.'],
    react: ['Ừ, chia vậy nghe được. Cậu lo logic, tớ lo giao diện, miễn là đừng sửa đè lên nhau.', 'Khoan, hướng này hơi mạo hiểm. Mình còn ít thời gian, làm cách chắc ăn trước đi.'],
    complete: ['Ok, vậy tớ biết đường làm tiếp. Có gì kẹt thì báo sớm, đừng im lặng tới lúc cháy.'],
  },
  'mentor-nova': {
    intro: ['{name}, ngồi lại nói thật nhé. Qua mấy tình huống rồi, đoạn nào làm bạn có hứng và đoạn nào khiến bạn muốn bỏ cuộc?'],
    react: ['Cậu nói thật hơn rồi đó. Nhưng lúc bị dí deadline, cậu thấy mình tỉnh hơn hay rối hơn?', 'Điểm đáng chú ý không phải là cậu sai, mà là sau khi sai cậu có bình tĩnh sửa được không.'],
    complete: ['Rồi, vậy là đủ để nhìn ra vài tín hiệu nghề nghiệp. Không phải phán quyết cuối đời, nhưng là dữ liệu tốt.'],
  },
};

function pickFrontendLine(actorId: string, group: string, seed: string): string {
  const list = frontendDialogues[actorId]?.[group];
  if (list) {
    return list[stableFrontendIndex(`${actorId}-${group}-${seed}`, list.length)];
  }

  const actor = getRoleplayActor(actorId as RoleplayActorId);
  const generic: Record<string, string[]> = {
    intro: [actor.signatureLine || `${actor.name} đang chờ câu trả lời của bạn.`],
    wrong: ['Cách này chưa ổn. Nói rõ hơn một bước cụ thể đi.'],
    wrongHot: ['Vẫn còn mơ hồ. Nếu đây là việc thật thì chưa đủ để đi tiếp.'],
    success: ['Ổn, hướng này nghe chắc hơn rồi.'],
    react: [
      `${actor.name}: nghe được, nhưng tôi cần bạn nói cụ thể hơn chỗ quan trọng nhất.`,
      'Đừng trả lời như đang làm trắc nghiệm. Nói như đang xử lý việc thật đi.',
    ],
    complete: ['Được. Câu trả lời này đủ để nhìn ra cách bạn xử lý tình huống nghề nghiệp.'],
  };

  const fallback = generic[group] ?? ['Rồi, tiếp tục.'];
  return fallback[stableFrontendIndex(`${actorId}-${group}-${seed}`, fallback.length)];
}

function pickFrontendFollowUp(stageId: RoleplayStageId, actorId: string, seed: string): string {
  const questions: Partial<Record<RoleplayStageId, string[]>> = {
    'open-stage-4': ['Nếu 10 phút nữa vẫn chưa cứu được phần đó, em báo với team kiểu gì?', 'Việc nào em dám cắt để bản demo vẫn kịp chạy?'],
    'open-stage-5': ['Vậy chốt đi: phần nào cậu nhận, phần nào tớ nhận?', 'Nếu cậu chưa xong đúng giờ thì báo tớ lúc nào để tớ xoay?'],
    'open-stage-6': ['Lúc áp lực nhất, bạn thấy mình tỉnh hơn hay rối hơn?', 'Nếu phải chọn một kỹ năng để sửa trước, bạn chọn gì?'],
  };
  const industry = getIndustryFallbackQuestions(stageId);
  const list = questions[stageId] ?? industry ?? ['Nếu cách đầu tiên không ổn, cậu xoay hướng thế nào?'];
  return list[stableFrontendIndex(`${stageId}-${actorId}-${seed}`, list.length)];
}

function getIndustryFallbackQuestions(stageId: RoleplayStageId): string[] | null {
  const key = String(stageId).split('-stage-')[0];
  const questions: Record<string, string[]> = {
    business: ['Em kiểm dữ liệu nào trước?', 'Nếu khách hoặc sếp hỏi mốc xử lý, em trả lời sao?', 'Phần nào em ưu tiên cứu trước?'],
    architecture: ['Công năng nào quan trọng nhất ở đây?', 'Nếu khách phản đối, em giải thích bằng lý do gì?', 'Rủi ro thi công hoặc sử dụng lớn nhất là gì?'],
    pharmacy: ['Thông tin nào bắt buộc phải hỏi trước?', 'Dấu hiệu nào khiến em phải khuyên đi khám?', 'Nếu chưa đủ thông tin, em dừng ở đâu?'],
    marketing: ['Insight nào em kiểm tra trước?', 'Chỉ số nào chứng minh hướng này đúng?', 'Nếu khách không duyệt, em sửa thông điệp theo hướng nào?'],
    accounting: ['Nguồn số nào em đối chiếu trước?', 'Khoản nào rủi ro cao nhất?', 'Thiếu chứng từ thì em xử lý sao?'],
    ecommerce: ['Khách đang kẹt ở bước nào trước khi mua?', 'Em xử lý khách nhận sai hàng bằng mốc nào?', 'Nếu kho đang nghẽn, em ưu tiên phần nào trước?'],
    uiux: ['Hành vi user nào chứng minh flow đang kẹt?', 'Nếu chỉ sửa một flow, em chọn flow nào?', 'Bằng chứng nào giúp em bảo vệ lựa chọn đó?'],
  };
  return questions[key] ?? null;
}

function stableFrontendIndex(text: string, length: number): number {
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
  }
  return hash % Math.max(1, length);
}

function getApiBaseUrl() {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL;

  if (typeof configuredUrl === 'string' && configuredUrl.trim()) {
    return configuredUrl.trim().replace(/\/+$/, '');
  }

  return 'http://localhost:3000';
}
