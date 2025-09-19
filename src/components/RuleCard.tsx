"use client"

import { useState } from "react"
import { Trash2, CheckCircle2, XCircle } from "lucide-react"
import { CSS_CLASSES } from "../constants"
import { useRules } from "../hooks/useRules"

export interface Rule {
  id: string
  name: string
  description?: string | null
  condition: string
  score: number
  isActive: boolean
  priority: number
  createdAt: string
}

export interface RuleCardProps {
  rule: Rule
}

export default function RuleCard({ rule }: RuleCardProps) {
  const [expandedRuleId, setExpandedRuleId] = useState<string | null>(null)
  const { toggleActive, updatePriority, removeRule } = useRules()

  let condition: any = null
  try {
    condition = JSON.parse(rule.condition)
  } catch {
    // Invalid JSON, ignore
  }

  const scoreChip = rule.score >= 0 ? `+${rule.score}` : `${rule.score}`
  const scoreClass = rule.score >= 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'

  return (
    <div className="p-4 border rounded-lg bg-white/90">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-semibold text-gray-900 truncate max-w-[40ch]">
              {rule.name}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              rule.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}>
              {rule.isActive ? 'Aktif' : 'Pasif'}
            </span>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
              Prio {rule.priority}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${scoreClass}`}>
              {scoreChip}
            </span>
          </div>

          {rule.description && (
            <p className="text-gray-600 text-sm mb-2 break-words">
              {rule.description}
            </p>
          )}

          {condition && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
                field: <b>{condition.field}</b>
              </span>
              <span className="text-[11px] px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
                op: <b>{condition.operator}</b>
              </span>
              <span className="text-[11px] px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
                value: <b>{String(condition.value)}</b>
              </span>
              <button
                onClick={() => setExpandedRuleId(expandedRuleId === rule.id ? null : rule.id)}
                className="text-[11px] px-2 py-1 border border-gray-200 rounded-full hover:bg-gray-50"
              >
                {expandedRuleId === rule.id ? 'Detayı Gizle' : 'Detay'}
              </button>
            </div>
          )}

          {expandedRuleId === rule.id && condition && (
            <pre className="mt-2 text-xs bg-gray-50 p-2 rounded border overflow-auto max-w-[70ch]">
              {JSON.stringify(condition, null, 2)}
            </pre>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => updatePriority(rule, +1)}
            className="px-3 py-1.5 text-xs rounded-lg border border-blue-200 text-blue-700 bg-white/70 shadow-sm hover:bg-gray-100 transition"
          >
            + prio
          </button>
          <button
            onClick={() => updatePriority(rule, -1)}
            className="px-3 py-1.5 text-xs rounded-lg border border-blue-200 text-blue-700 bg-white/70 shadow-sm hover:bg-gray-100 transition"
          >
            - prio
          </button>
          <button
            onClick={() => toggleActive(rule)}
            className={`px-3 py-1.5 text-xs rounded-lg inline-flex items-center gap-1 shadow-sm transition ${
              rule.isActive 
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' 
                : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
            }`}
          >
            {rule.isActive ? (
              <>
                <XCircle className="w-4 h-4" /> Pasif Yap
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" /> Aktif Yap
              </>
            )}
          </button>
          <button
            onClick={() => removeRule(rule)}
            className="px-3 py-1.5 text-xs rounded-lg inline-flex items-center gap-1 bg-gradient-to-r from-rose-500 to-red-500 text-white shadow-sm hover:opacity-90 transition"
          >
            <Trash2 className="w-4 h-4" /> Sil
          </button>
        </div>
      </div>
    </div>
  )
}
