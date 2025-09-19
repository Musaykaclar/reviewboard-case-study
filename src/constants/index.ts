// Risk skorları için sabitler
export const RISK_THRESHOLDS = {
  HIGH: 80,
  MEDIUM: 50,
  LOW: 20,
  VERY_LOW: 0,
} as const

// Risk seviyeleri
export const RISK_LEVELS = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM', 
  LOW: 'LOW',
  VERY_LOW: 'VERY_LOW',
} as const

// Status seçenekleri
export const STATUS_OPTIONS = [
  { value: 'NEW', label: 'Yeni' },
  { value: 'IN_REVIEW', label: 'İnceleniyor' },
  { value: 'APPROVED', label: 'Onaylandı' },
  { value: 'REJECTED', label: 'Reddedildi' },
] as const

// Risk filtre seçenekleri
export const RISK_FILTER_OPTIONS = [
  { value: 'HIGH', label: 'Yüksek (≥ 80)', min: 80, max: 100 },
  { value: 'MEDIUM', label: 'Orta (50-79)', min: 50, max: 79 },
  { value: 'LOW', label: 'Düşük (20-49)', min: 20, max: 49 },
  { value: 'VERY_LOW', label: 'Çok Düşük (< 20)', min: 0, max: 19 },
] as const

// Form validation mesajları
export const VALIDATION_MESSAGES = {
  REQUIRED_FIELDS: 'Title ve Amount gerekli',
  ITEM_CREATE_ERROR: 'Item eklenemedi',
  GENERIC_ERROR: 'Bir hata oluştu. Lütfen tekrar deneyin.',
  RULE_CREATE_ERROR: 'Kural oluşturulamadı',
  DELETE_CONFIRM: 'Silmek istediğinize emin misiniz?',
} as const

// API endpoints
export const API_ENDPOINTS = {
  ITEMS: '/api/items',
  RULES: '/api/rules',
  SCORE: '/api/score',
} as const

// CSS class isimleri
export const CSS_CLASSES = {
  DASHBOARD_CONTAINER: 'dashboard-container',
  DASHBOARD_FORM_CARD: 'dashboard-form-card',
  DASHBOARD_FORM_TITLE: 'dashboard-form-title',
  DASHBOARD_INPUT: 'dashboard-input',
  DASHBOARD_ADD_BTN: 'dashboard-add-btn',
  DASHBOARD_ITEMS_GRID: 'dashboard-items-grid',
  DASHBOARD_ITEM_CARD: 'dashboard-item-card',
  DASHBOARD_ITEM_TITLE: 'dashboard-item-title',
  DASHBOARD_ITEM_DESCRIPTION: 'dashboard-item-description',
  DASHBOARD_ITEM_AMOUNT: 'dashboard-item-amount',
  DASHBOARD_NO_SESSION: 'dashboard-no-session',
} as const

// Status renkleri
export const STATUS_COLORS = {
  NEW: 'bg-blue-100 text-blue-800',
  IN_REVIEW: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
} as const

// Risk skor renkleri
export const RISK_SCORE_COLORS = {
  HIGH: 'bg-red-100 text-red-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  LOW: 'bg-blue-100 text-blue-800',
  VERY_LOW: 'bg-green-100 text-green-800',
} as const

// Default form değerleri
export const DEFAULT_FORM_VALUES = {
  ITEM: {
    title: '',
    description: '',
    amount: '',
    tags: '',
  },
  RULE: {
    name: '',
    description: '',
    condition: '{"field":"amount","operator":">","value":5000}',
    score: 20,
    isActive: true,
    priority: 0,
  },
} as const

// Rule builder için alan tipleri
export const RULE_FIELD_TYPES = {
  AMOUNT: 'amount',
  TAGS: 'tags',
  DESCRIPTION: 'description',
  STATUS: 'status',
  TITLE: 'title',
} as const

// Rule builder için operatör tipleri
export const RULE_OPERATORS = {
  GREATER_THAN: '>',
  GREATER_EQUAL: '>=',
  LESS_THAN: '<',
  LESS_EQUAL: '<=',
  EQUAL: '==',
  INCLUDES: 'includes',
  CONTAINS: 'contains',
} as const

// Operatör seçenekleri (alan tipine göre)
export const OPERATOR_OPTIONS = {
  [RULE_FIELD_TYPES.AMOUNT]: [
    RULE_OPERATORS.GREATER_THAN,
    RULE_OPERATORS.GREATER_EQUAL,
    RULE_OPERATORS.LESS_THAN,
    RULE_OPERATORS.LESS_EQUAL,
    RULE_OPERATORS.EQUAL,
  ],
  [RULE_FIELD_TYPES.STATUS]: [RULE_OPERATORS.EQUAL],
  [RULE_FIELD_TYPES.TAGS]: [RULE_OPERATORS.INCLUDES, RULE_OPERATORS.CONTAINS],
  [RULE_FIELD_TYPES.DESCRIPTION]: [RULE_OPERATORS.INCLUDES, RULE_OPERATORS.CONTAINS],
  [RULE_FIELD_TYPES.TITLE]: [RULE_OPERATORS.INCLUDES, RULE_OPERATORS.CONTAINS],
} as const
