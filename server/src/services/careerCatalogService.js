const FREE_CAREER_IDS = ['it', 'business', 'architecture', 'pharmacy'];
const PAID_CAREER_IDS = ['marketing', 'accounting', 'ecommerce', 'uiux'];
const CAREER_UNLOCK_PRICE = 15000;

const careerCatalog = [
  { id: 'it', title: 'Công nghệ thông tin', shortTitle: 'IT', price: 0, isFree: true, roles: ['Software Developer', 'QA / Tester', 'Business Analyst'] },
  { id: 'business', title: 'Quản trị kinh doanh', shortTitle: 'Quản trị', price: 0, isFree: true, roles: ['Business Analyst', 'Operations Executive', 'Account Executive'] },
  { id: 'architecture', title: 'Kiến trúc', shortTitle: 'Kiến trúc', price: 0, isFree: true, roles: ['Architect Assistant', 'Interior Designer', 'Site Coordinator'] },
  { id: 'pharmacy', title: 'Dược', shortTitle: 'Dược', price: 0, isFree: true, roles: ['Pharmacy Assistant', 'Clinical Support', 'Medical Sales Representative'] },
  { id: 'marketing', title: 'Marketing', shortTitle: 'Marketing', price: CAREER_UNLOCK_PRICE, isFree: false, roles: ['Content Marketer', 'Campaign Planner', 'Social Media Executive'] },
  { id: 'accounting', title: 'Kế toán - Tài chính', shortTitle: 'Kế toán', price: CAREER_UNLOCK_PRICE, isFree: false, roles: ['Accountant Assistant', 'Financial Analyst Intern', 'Internal Control Staff'] },
  { id: 'ecommerce', title: 'Thương mại điện tử', shortTitle: 'E-commerce', price: CAREER_UNLOCK_PRICE, isFree: false, roles: ['E-commerce Operations', 'Marketplace Executive', 'Online Store Coordinator'] },
  { id: 'uiux', title: 'Thiết kế UI/UX', shortTitle: 'UI/UX', price: CAREER_UNLOCK_PRICE, isFree: false, roles: ['UI Designer', 'UX Research Assistant', 'Product Designer Intern'] },
];

function getCareerById(careerId) {
  return careerCatalog.find((career) => career.id === normalizeCareerId(careerId)) || null;
}

function isKnownCareerId(careerId) {
  return Boolean(getCareerById(careerId));
}

function normalizeCareerId(careerId) {
  return String(careerId || '').trim().toLowerCase() === 'law'
    ? 'ecommerce'
    : String(careerId || '').trim().toLowerCase();
}

module.exports = {
  CAREER_UNLOCK_PRICE,
  FREE_CAREER_IDS,
  PAID_CAREER_IDS,
  careerCatalog,
  getCareerById,
  isKnownCareerId,
  normalizeCareerId,
};
