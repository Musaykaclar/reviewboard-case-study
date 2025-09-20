import { prisma } from "./prisma"

export type RuleCondition = {
  field: "amount" | "tags" | "description" | "status" | "title"
  operator: ">" | ">=" | "<" | "<=" | "==" | "includes" | "contains"
  value: number | string
}

export type CompiledRule = {
  id: string
  name: string
  score: number
  priority: number
  isActive: boolean
  condition: RuleCondition
}

export async function fetchActiveRules(): Promise<CompiledRule[]> {
  const rules = await prisma.rule.findMany({
    where: { isActive: true },
    orderBy: { priority: "desc" },
  })

  return rules.map((r) => ({
    id: r.id,
    name: r.name,
    score: r.score,
    priority: r.priority,
    isActive: r.isActive,
    condition: safeParseCondition(r.condition),
  }))
}

function safeParseCondition(condition: string): RuleCondition {
  try {
    const parsed = JSON.parse(condition)
    return parsed as RuleCondition
  } catch {
    return { field: "amount", operator: ">", value: 0 }
  }
}

export function evaluateRuleOnItem(rule: CompiledRule, item: Record<string, unknown>): boolean {
  const { field, operator, value } = rule.condition
  const fieldValue = item[field]

  switch (field) {
    case "amount": {
      const numeric = Number(fieldValue ?? 0)
      const target = Number(value)
      if (operator === ">") return numeric > target
      if (operator === ">=") return numeric >= target
      if (operator === "<") return numeric < target
      if (operator === "<=") return numeric <= target
      if (operator === "==") return numeric === target
      return false
    }
    case "tags": {
      const tags: string[] = Array.isArray(fieldValue) ? fieldValue.map((t: string) => String(t).toLowerCase()) : []
      const needle = String(value).toLowerCase()
      return tags.includes(needle) || tags.some(t => t.includes(needle))
    }
    case "description":
    case "title": {
      const text = String(fieldValue ?? "").toLowerCase()
      const needle = String(value).toLowerCase()
      return operator === "includes" || operator === "contains" ? text.includes(needle) : text === needle
    }
    case "status": {
      return String(fieldValue) === String(value)
    }
    default:
      return false
  }
}

export async function calculateRiskByRules(item: Record<string, unknown>): Promise<number> {
  const rules = await fetchActiveRules()

  // Kural yoksa eski basit hesaplamaya geri dön (fallback)
  if (!rules || rules.length === 0) {
    return simpleFallbackRisk(item)
  }

  let risk = 0
  for (const rule of rules) {
    if (!rule.isActive) continue
    if (evaluateRuleOnItem(rule, item)) {
      risk += Number(rule.score) || 0
    }
  }
  if (risk < 0) risk = 0
  if (risk > 100) risk = 100
  return Math.round(risk)
}

// Eski if-else kuralları ile yedek risk hesabı
function simpleFallbackRisk(item: Record<string, unknown>): number {
  let risk = 0
  const amount = Number(item.amount || 0)
  if (amount > 10000) risk = 80
  else if (amount > 5000) risk = 50
  else risk = 20

  const tags: string[] = Array.isArray(item.tags) ? item.tags.map((t: string) => String(t).toLowerCase()) : []
  if (tags.includes('urgent')) risk += 20
  if (tags.includes('fraud')) risk = 100
  if (tags.includes('trusted')) risk -= 20

  const desc = String(item.description || '').toLowerCase()
  if (desc.includes('suspicious')) risk += 30
  if (desc.includes('verified')) risk -= 10

  if (risk < 0) risk = 0
  if (risk > 100) risk = 100
  return Math.round(risk)
}


