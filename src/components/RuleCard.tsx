"use client"

import { useState, useEffect } from "react"
import { Trash2, CheckCircle2, XCircle, Settings, Target, BarChart3, ChevronDown, ChevronUp, Code, Edit3, Save, X } from "lucide-react"
import "../app/globals.css"

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
  toggleActive: (rule: Rule) => Promise<void>
  updatePriority: (rule: Rule, delta: number) => Promise<void>
  removeRule: (rule: Rule) => Promise<boolean>
}

export default function RuleCard({ rule, toggleActive, updatePriority, removeRule }: RuleCardProps) {
  const [expandedRuleId, setExpandedRuleId] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: rule.name,
    description: rule.description || '',
    score: rule.score,
    priority: rule.priority,
    isActive: rule.isActive
  })
  // Props'tan gelen fonksiyonları kullanıyoruz

  let condition: Record<string, unknown> | null = null
  try {
    condition = JSON.parse(rule.condition)
  } catch {
    // Invalid JSON, ignore
  }

  const scoreChip = rule.score >= 0 ? `+${rule.score}` : `${rule.score}`
  const scoreClass = rule.score >= 0 ? 'bg-gradient-to-r from-emerald-400 to-green-500' : 'bg-gradient-to-r from-red-400 to-pink-500'

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/rules/${rule.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      
      if (res.ok) {
        const updatedRule = await res.json()
        // State'i güncelle
        setEditForm({
          name: updatedRule.name,
          description: updatedRule.description || '',
          score: updatedRule.score,
          priority: updatedRule.priority,
          isActive: updatedRule.isActive
        })
        setIsEditing(false)
        // Parent component'e güncelleme bildir
        window.dispatchEvent(new CustomEvent('ruleUpdated', { detail: updatedRule }))
      }
    } catch (error) {
      console.error('Update rule error:', error)
    }
  }

  const handleCancel = () => {
    setEditForm({
      name: rule.name,
      description: rule.description || '',
      score: rule.score,
      priority: rule.priority,
      isActive: rule.isActive
    })
    setIsEditing(false)
  }

  // Event listener for rule updates
  useEffect(() => {
    const handleRuleUpdate = (event: CustomEvent) => {
      if (event.detail.id === rule.id) {
        setEditForm({
          name: event.detail.name,
          description: event.detail.description || '',
          score: event.detail.score,
          priority: event.detail.priority,
          isActive: event.detail.isActive
        })
      }
    }

    window.addEventListener('ruleUpdated', handleRuleUpdate as EventListener)
    return () => {
      window.removeEventListener('ruleUpdated', handleRuleUpdate as EventListener)
    }
  }, [rule.id])

  return (
    <div className="relative overflow-hidden bg-white rounded-2xl shadow-xl border border-gray-200/50 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 backdrop-blur-sm">
      {/* Gradient Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 via-blue-50/20 to-cyan-50/30 pointer-events-none" />
      
      {/* Main Content */}
      <div className="relative p-6">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
                <Settings className="w-5 h-5" />
              </div>
               <div className="flex-1">
                 {isEditing ? (
                   <div className="space-y-3">
                     <input
                       type="text"
                       value={editForm.name}
                       onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                       placeholder="Kural adı"
                     />
                     <textarea
                       value={editForm.description}
                       onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                       placeholder="Açıklama"
                       rows={2}
                     />
                     <div className="flex gap-2">
                       <input
                         type="number"
                         value={editForm.score}
                         onChange={(e) => setEditForm(prev => ({ ...prev, score: parseInt(e.target.value) || 0 }))}
                         className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                         placeholder="Puan"
                       />
                       <input
                         type="number"
                         value={editForm.priority}
                         onChange={(e) => setEditForm(prev => ({ ...prev, priority: parseInt(e.target.value) || 0 }))}
                         className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                         placeholder="Öncelik"
                       />
                       <label className="flex items-center gap-2">
                         <input
                           type="checkbox"
                           checked={editForm.isActive}
                           onChange={(e) => setEditForm(prev => ({ ...prev, isActive: e.target.checked }))}
                           className="rounded"
                         />
                         <span className="text-sm">Aktif</span>
                       </label>
                     </div>
                   </div>
                 ) : (
                   <>
                     <h3 className="text-xl font-bold text-gray-800 leading-tight">
                       {rule.name}
                     </h3>
                     <div className="flex items-center gap-3 mt-1">
                       <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${rule.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                         <div className={`w-2 h-2 rounded-full ${rule.isActive ? 'bg-green-500' : 'bg-gray-400'} animate-pulse`} />
                         {rule.isActive ? 'Aktif' : 'Pasif'}
                       </div>
                       <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                         <Target className="w-3 h-3" />
                         Öncelik {rule.priority}
                       </div>
                     </div>
                   </>
                 )}
               </div>
            </div>
            
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Save className="w-4 h-4" />
                    Kaydet
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    İptal
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Edit3 className="w-4 h-4" />
                    Düzenle
                  </button>
                  <div className={`px-4 py-2 rounded-xl text-white font-bold text-sm shadow-lg ${scoreClass}`}>
                    <div className="flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4" />
                      {scoreChip} puan
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {rule.description && (
            <div className="bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-xl p-4 border border-gray-200/50">
              <p className="text-gray-700 leading-relaxed font-medium">
                {rule.description}
              </p>
            </div>
          )}
        </div>

        {/* Condition Section */}
        {condition && (
          <div className="mb-6">
            <div className="bg-gradient-to-br from-slate-50 to-gray-100/50 rounded-xl p-5 border border-gray-200/50 shadow-inner">
              <div className="flex items-center gap-2 mb-4">
                <Code className="w-4 h-4 text-indigo-600" />
                <h4 className="text-sm font-bold text-gray-800">Kural Koşulları</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200/50 shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-xs font-semibold text-indigo-600 mb-2">Alan</div>
                  <div className="font-bold text-gray-800 text-sm">{String(condition.field)}</div>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-gray-200/50 shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-xs font-semibold text-purple-600 mb-2">Operatör</div>
                  <div className="font-bold text-gray-800 text-sm">{String(condition.operator)}</div>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-gray-200/50 shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-xs font-semibold text-pink-600 mb-2">Değer</div>
                  <div className="font-bold text-gray-800 text-sm">{String(condition.value)}</div>
                </div>
              </div>
              
              <button
                onClick={() => setExpandedRuleId(expandedRuleId === rule.id ? null : rule.id)}
                className="group flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-indigo-600 hover:text-white bg-indigo-50 hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-600 rounded-lg border border-indigo-200 hover:border-transparent transition-all duration-300 hover:shadow-lg hover:scale-105"
              >
                {expandedRuleId === rule.id ? (
                  <>
                    <ChevronUp className="w-4 h-4 group-hover:animate-bounce" />
                    JSON Detayını Gizle
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 group-hover:animate-bounce" />
                    JSON Detayını Göster
                  </>
                )}
              </button>

              {expandedRuleId === rule.id && condition && (
                <div className="mt-4 bg-gray-900 rounded-lg p-4 border border-gray-700 shadow-xl">
                  <pre className="text-sm text-green-300 overflow-auto max-w-full font-mono">
                    {JSON.stringify(condition, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

         {/* Actions Section */}
         {!isEditing && (
           <div className="pt-6 border-t border-gray-200/50">
             <div className="flex flex-wrap items-center justify-center gap-4">
               <button
                 onClick={() => updatePriority(rule, +1)}
                 className="group relative overflow-hidden flex items-center justify-center gap-3 px-6 py-4 text-sm font-bold rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 border border-white/20"
               >
                 <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                 <div className="relative z-10 flex items-center gap-3">
                   <ChevronUp className="w-5 h-5 group-hover:animate-bounce" />
                   <span className="text-base">Öncelik Artır</span>
                 </div>
               </button>
               
               <button
                 onClick={() => updatePriority(rule, -1)}
                 className="group relative overflow-hidden flex items-center justify-center gap-3 px-6 py-4 text-sm font-bold rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-500 text-white shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 hover:from-cyan-600 hover:via-blue-600 hover:to-indigo-600 border border-white/20"
               >
                 <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                 <div className="relative z-10 flex items-center gap-3">
                   <ChevronDown className="w-5 h-5 group-hover:animate-bounce" />
                   <span className="text-base">Öncelik Azalt</span>
                 </div>
               </button>
               
               <button
                 onClick={() => toggleActive(rule)}
                 className={`group relative overflow-hidden flex items-center justify-center gap-3 px-6 py-4 text-sm font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 border border-white/20 ${
                   rule.isActive 
                     ? 'bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 text-white hover:from-orange-600 hover:via-red-600 hover:to-pink-600' 
                     : 'bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 text-white hover:from-emerald-600 hover:via-green-600 hover:to-teal-600'
                 }`}
               >
                 <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                 <div className="relative z-10 flex items-center gap-3">
                   {rule.isActive ? (
                     <>
                       <XCircle className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                       <span className="text-base">Durdur</span>
                     </>
                   ) : (
                     <>
                       <CheckCircle2 className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                       <span className="text-base">Başlat</span>
                     </>
                   )}
                 </div>
               </button>
               
               <button
                 onClick={() => removeRule(rule)}
                 className="group relative overflow-hidden flex items-center justify-center gap-3 px-6 py-4 text-sm font-bold rounded-2xl bg-gradient-to-br from-red-500 via-rose-500 to-pink-500 text-white shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 hover:from-red-600 hover:via-rose-600 hover:to-pink-600 border border-white/20"
               >
                 <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                 <div className="relative z-10 flex items-center gap-3">
                   <Trash2 className="w-5 h-5 group-hover:animate-pulse" />
                   <span className="text-base">Sil</span>
                 </div>
               </button>
             </div>
           </div>
         )}
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-200/30 to-transparent rounded-bl-full" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-200/30 to-transparent rounded-tr-full" />
    </div>
  )
}