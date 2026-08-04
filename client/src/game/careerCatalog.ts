export type CareerId =
  | 'it'
  | 'business'
  | 'architecture'
  | 'pharmacy'
  | 'marketing'
  | 'accounting'
  | 'ecommerce'
  | 'uiux';

export type CareerGameMode = 'it-hybrid' | 'industry-roleplay';

export interface CareerCatalogItem {
  id: CareerId;
  icon: string;
  title: string;
  shortTitle: string;
  line: string;
  price: number;
  isFree: boolean;
  gameMode: CareerGameMode;
  tag: string;
  roles: string[];
}

export const FREE_CAREER_IDS: CareerId[] = [
  'it',
  'business',
  'architecture',
  'pharmacy',
];

export const PAID_CAREER_IDS: CareerId[] = [
  'marketing',
  'accounting',
  'ecommerce',
  'uiux',
];

export const CAREER_UNLOCK_PRICE = 15000;

export const careerCatalog: CareerCatalogItem[] = [
  {
    id: 'it',
    icon: '💻',
    title: 'Công nghệ thông tin',
    shortTitle: 'IT',
    line: 'Vào vai lập trình viên, tester và phân tích nghiệp vụ trong môi trường công nghệ hiện đại.',
    price: 0,
    isFree: true,
    gameMode: 'it-hybrid',
    tag: 'FREE',
    roles: ['Software Developer', 'QA / Tester', 'Business Analyst'],
  },
  {
    id: 'business',
    icon: '📈',
    title: 'Quản trị kinh doanh',
    shortTitle: 'Quản trị',
    line: 'Vào vai nhân sự quản trị phải xử lý doanh số, khách hàng và vận hành.',
    price: 0,
    isFree: true,
    gameMode: 'industry-roleplay',
    tag: 'FREE',
    roles: ['Business Analyst', 'Operations Executive', 'Account Executive'],
  },
  {
    id: 'architecture',
    icon: '🏗️',
    title: 'Kiến trúc',
    shortTitle: 'Kiến trúc',
    line: 'Vào vai kiến trúc sư, thiết kế nội thất và quản lý công trình trong môi trường xây dựng.',
    price: 0,
    isFree: true,
    gameMode: 'industry-roleplay',
    tag: 'FREE',
    roles: ['Architect Assistant', 'Interior Designer', 'Site Coordinator'],
  },
  {
    id: 'pharmacy',
    icon: '💊',
    title: 'Dược',
    shortTitle: 'Dược',
    line: 'Tư vấn tại quầy, hỏi đúng thông tin, nhận diện rủi ro và biết chuyển tuyến.',
    price: 0,
    isFree: true,
    gameMode: 'industry-roleplay',
    tag: 'FREE',
    roles: ['Pharmacy Assistant', 'Clinical Support', 'Medical Sales Representative'],
  },
  {
    id: 'marketing',
    icon: '📣',
    title: 'Marketing',
    shortTitle: 'Marketing',
    line: 'Vào vai marketer, lên kế hoạch chiến dịch và thuyết phục khách hàng trong môi trường marketing hiện đại.',
    price: CAREER_UNLOCK_PRICE,
    isFree: false,
    gameMode: 'industry-roleplay',
    tag: '15.000đ',
    roles: ['Content Marketer', 'Campaign Planner', 'Social Media Executive'],
  },
  {
    id: 'accounting',
    icon: '🧾',
    title: 'Kế toán - Tài chính',
    shortTitle: 'Kế toán',
    line: 'Vào vai kế toán, kiểm toán và phân tích tài chính trong môi trường doanh nghiệp hiện đại.',
    price: CAREER_UNLOCK_PRICE,
    isFree: false,
    gameMode: 'industry-roleplay',
    tag: '15.000đ',
    roles: ['Accountant Assistant', 'Financial Analyst Intern', 'Internal Control Staff'],
  },
  {
    id: 'ecommerce',
    icon: '🛒',
    title: 'Thương mại điện tử',
    shortTitle: 'E-commerce',
    line: 'Vào vai nhân viên vận hành, xử lý đơn hàng và phân tích chỉ số bán hàng trên sàn thương mại điện tử.',
    price: CAREER_UNLOCK_PRICE,
    isFree: false,
    gameMode: 'industry-roleplay',
    tag: '15.000đ',
    roles: ['E-commerce Operations', 'Marketplace Executive', 'Online Store Coordinator'],
  },
  {
    id: 'uiux',
    icon: '🎨',
    title: 'Thiết kế UI/UX',
    shortTitle: 'UI/UX',
    line: 'Vào vai thiết kế viên, nghiên cứu người dùng và quản lý sản phẩm để bảo vệ quyết định thiết kế.',
    price: CAREER_UNLOCK_PRICE,
    isFree: false,
    gameMode: 'industry-roleplay',
    tag: '15.000đ',
    roles: ['UI Designer', 'UX Research Assistant', 'Product Designer Intern'],
  },
];

export function getCareerById(careerId: CareerId | string | null) {
  return careerCatalog.find((career) => career.id === careerId);
}

export function isCareerUnlocked(careerId: CareerId, unlockedCareerIds: CareerId[]) {
  const career = getCareerById(careerId);
  if (!career) return false;
  return career.isFree || unlockedCareerIds.includes(careerId);
}

export function formatVnd(amount: number) {
  return new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ';
}
