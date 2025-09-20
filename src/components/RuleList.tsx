"use client"

import { Rule } from "../hooks/useRules"
import RuleCard from "./RuleCard"

export interface RuleListProps {
  rules: Rule[]
  loading: boolean
  toggleActive: (rule: Rule) => Promise<void>
  updatePriority: (rule: Rule, delta: number) => Promise<void>
  removeRule: (rule: Rule) => Promise<boolean>
}

export default function RuleList({ rules, loading, toggleActive, updatePriority, removeRule }: RuleListProps) {
  if (loading) {
    return (
      <div className="text-center py-8 text-gray-600">
        Yükleniyor...
      </div>
    )
  }

  if (rules.length === 0) {
    return (
      <div className="text-center py-10 text-gray-600">
        Henüz kural yok
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {rules.map((rule) => (
        <RuleCard 
          key={rule.id} 
          rule={rule}
          toggleActive={toggleActive}
          updatePriority={updatePriority}
          removeRule={removeRule}
        />
      ))}
    </div>
  )
}
