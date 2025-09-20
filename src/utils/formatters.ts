import { STATUS_COLORS, RISK_SCORE_COLORS } from "../constants"

// Para birimi formatı
export const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  })
}

// Status label'ını Türkçe'ye çevir
export const getStatusLabel = (status: string): string => {
  const statusMap: Record<string, string> = {
    'NEW': 'Yeni',
    'IN_REVIEW': 'İnceleniyor',
    'APPROVED': 'Onaylandı',
    'REJECTED': 'Reddedildi',
  }
  return statusMap[status] || status
}

// Status için CSS class'ını al
export const getStatusColor = (status: string): string => {
  return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.NEW
}

// Risk skoru için renk class'ını al
export const getRiskScoreColor = (riskScore: number): string => {
  if (riskScore >= 80) return RISK_SCORE_COLORS.HIGH
  if (riskScore >= 50) return RISK_SCORE_COLORS.MEDIUM
  if (riskScore >= 20) return RISK_SCORE_COLORS.LOW
  return RISK_SCORE_COLORS.VERY_LOW
}

// Risk seviyesini belirle
export const getRiskLevel = (riskScore: number): string => {
  if (riskScore >= 80) return 'HIGH'
  if (riskScore >= 50) return 'MEDIUM'
  if (riskScore >= 20) return 'LOW'
  return 'VERY_LOW'
}

// Tag'leri string'den array'e çevir
export const parseTags = (tagsInput: string): string[] => {
  return tagsInput
    .split(',')
    .map(tag => tag.trim())
    .filter(Boolean)
}

// Item'ı API'ye göndermek için hazırla
export const prepareItemForAPI = (formData: {
  title: string
  description: string
  amount: string | number
  tagsInput: string
}) => {
  return {
    title: formData.title,
    description: formData.description,
    amount: formData.amount,
    tags: parseTags(formData.tagsInput),
  }
}
