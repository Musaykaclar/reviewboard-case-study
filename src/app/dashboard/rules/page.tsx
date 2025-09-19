"use client"

import { useEffect, useMemo, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Settings, ArrowLeft, Plus, Trash2, CheckCircle2, XCircle, Save } from "lucide-react"
import "../../globals.css"

type Rule = {
  id: string
  name: string
  description?: string | null
  condition: string
  score: number
  isActive: boolean
  priority: number
  createdAt: string
}

const defaultForm = {
  name: "",
  description: "",
  condition: "{\"field\":\"amount\",\"operator\":\">\",\"value\":5000}",
  score: 20,
  isActive: true,
  priority: 0,
}

type FieldType = "amount" | "tags" | "description" | "status" | "title"
type OperatorType = ">" | ">=" | "<" | "<=" | "==" | "includes" | "contains"

export default function RulesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [rules, setRules] = useState<Rule[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState(defaultForm)
  const [builder, setBuilder] = useState<{ field: FieldType; operator: OperatorType; value: string | number }>({
    field: "amount",
    operator: ">",
    value: 5000,
  })
  const [expandedRuleId, setExpandedRuleId] = useState<string | null>(null)

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const res = await fetch('/api/rules')
        const data = await res.json()
        setRules(data.rules || [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchRules()
  }, [])

  const builderOperators = (field: FieldType): OperatorType[] => {
    if (field === 'amount') return [">", ">=", "<", "<=", "=="]
    if (field === 'status') return ["=="]
    if (field === 'tags' || field === 'description' || field === 'title') return ["includes", "contains"]
    return ["=="]
  }

  const validateBuilder = () => {
    if (builder.field === 'amount' && typeof builder.value !== 'number') return false
    if ((builder.field === 'tags' || builder.field === 'description' || builder.field === 'title') && !String(builder.value || '').trim()) return false
    if (builder.field === 'status' && !['NEW','IN_REVIEW','APPROVED','REJECTED'].includes(String(builder.value))) return false
    return true
  }

  if (!session) {
    return (
      <div className="dashboard-no-session">
        <div className="text-center">
          <Settings style={{ width: '64px', height: '64px', margin: '0 auto 1rem' }} />
          <p>Giriş yapmanız gerekiyor</p>
        </div>
      </div>
    )
  }

  const handleCreate = async () => {
    if (!form.name || !validateBuilder()) {
      alert('Lütfen geçerli bir ad ve kural seçimi yapın.')
      return
    }
    setSubmitting(true)
    try {
      const condition = JSON.stringify({ field: builder.field, operator: builder.operator, value: builder.value })
      const res = await fetch('/api/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          score: form.score,
          priority: form.priority,
          isActive: form.isActive,
          condition,
        }),
      })
      if (res.ok) {
        const created = await res.json()
        setRules([created, ...rules])
        setForm(defaultForm)
        setBuilder({ field: 'amount', operator: '>', value: 5000 })
      } else {
        const err = await res.json().catch(() => ({}))
        alert(err.error || 'Kural oluşturulamadı')
      }
    } catch (e) {
      console.error(e)
      alert('Bir hata oluştu')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleActive = async (rule: Rule) => {
    try {
      const res = await fetch(`/api/rules/${rule.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !rule.isActive }),
      })
      if (res.ok) {
        const updated = await res.json()
        setRules(rules.map(r => r.id === rule.id ? updated : r))
      }
    } catch (e) {
      console.error(e)
    }
  }

  const updatePriority = async (rule: Rule, delta: number) => {
    try {
      const res = await fetch(`/api/rules/${rule.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority: rule.priority + delta }),
      })
      if (res.ok) {
        const updated = await res.json()
        setRules(rules.map(r => r.id === rule.id ? updated : r).sort((a,b) => b.priority - a.priority))
      }
    } catch (e) {
      console.error(e)
    }
  }

  const removeRule = async (rule: Rule) => {
    if (!confirm('Silmek istediğinize emin misiniz?')) return
    try {
      const res = await fetch(`/api/rules/${rule.id}`, { method: 'DELETE' })
      if (res.ok) {
        setRules(rules.filter(r => r.id !== rule.id))
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="dashboard-container">
      {/* Renkli background efektleri */}
      <div className="dashboard-background">
        <div className="dashboard-circle-1"></div>
        <div className="dashboard-circle-2"></div>
        <div className="dashboard-circle-3"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <div className="dashboard-form-card mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h1 className="dashboard-form-title flex items-center gap-2">
                  <Settings className="w-6 h-6" />
                  Rules
                </h1>
                <p className="text-gray-600">Risk skorunu etkileyen kuralları yönetin</p>
              </div>
            </div>
          </div>
        </div>

        {/* Yeni Kural */}
        <div className="dashboard-form-card mb-6">
          <h2 className="dashboard-form-title flex items-center gap-2">
            <Plus className="w-5 h-5" /> Yeni Kural Ekle
          </h2>
          {/* Görsel Kural Oluşturucu (JSON gizli) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Alan</label>
              <select
                className="dashboard-input w-full"
                value={builder.field}
                onChange={(e) => {
                  const field = e.target.value as FieldType
                  const ops = builderOperators(field)
                  setBuilder({ field, operator: ops[0], value: field === 'amount' ? 5000 : '' })
                }}
              >
                <option value="amount">amount</option>
                <option value="tags">tags</option>
                <option value="description">description</option>
                <option value="title">title</option>
                <option value="status">status</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Operatör</label>
              <select
                className="dashboard-input w-full"
                value={builder.operator}
                onChange={(e) => setBuilder({ ...builder, operator: e.target.value as OperatorType })}
              >
                {builderOperators(builder.field).map(op => (
                  <option key={op} value={op}>{op}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Değer</label>
              {builder.field === 'amount' ? (
                <div className="grid grid-cols-5 gap-3 items-center">
                  <input
                    className="dashboard-input col-span-3"
                    type="number"
                    value={builder.value as any}
                    onChange={(e) => setBuilder({ ...builder, value: Number(e.target.value) })}
                  />
                  <input
                    className="col-span-2"
                    type="range"
                    min={0}
                    max={20000}
                    step={100}
                    value={Number(builder.value) || 0}
                    onChange={(e) => setBuilder({ ...builder, value: Number(e.target.value) })}
                  />
                </div>
              ) : builder.field === 'status' ? (
                <div className="flex flex-wrap gap-3">
                  {['NEW','IN_REVIEW','APPROVED','REJECTED'].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setBuilder({ ...builder, value: s })}
                      className={`px-3 py-1.5 rounded-lg border text-sm shadow-sm transition ${builder.value === s ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-transparent' : 'border-gray-200 text-gray-700 bg-white/70 hover:bg-gray-100'}`}
                    >{s}</button>
                  ))}
                </div>
              ) : (
                <input
                  className="dashboard-input w-full"
                  type="text"
                  value={builder.value as any}
                  onChange={(e) => setBuilder({ ...builder, value: e.target.value })}
                  placeholder={builder.field === 'tags' ? 'ör. urgent' : 'ör. suspicious / invoice'}
                />
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ad</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="dashboard-input w-full"
                placeholder="Örn: Yüksek Tutar"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Skor (+)</label>
              <input
                type="number"
                value={form.score}
                onChange={(e) => setForm({ ...form, score: Number(e.target.value) })}
                className="dashboard-input w-full"
                placeholder="Örn: 20"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Açıklama</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="dashboard-input w-full"
                placeholder="Opsiyonel"
              />
            </div>
            {/* Hazır Şablonlar - Builder'a uygular */}
            <div className="md:col-span-2">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setBuilder({ field: 'amount', operator: '>', value: 5000 })}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 bg-white/70 hover:bg-gray-100 shadow-sm transition"
                >Amount &gt; 5000</button>
                <button
                  onClick={() => setBuilder({ field: 'tags', operator: 'contains', value: 'urgent' })}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 bg-white/70 hover:bg-gray-100 shadow-sm transition"
                >Tag contains "urgent"</button>
                <button
                  onClick={() => setBuilder({ field: 'description', operator: 'includes', value: 'suspicious' })}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 bg-white/70 hover:bg-gray-100 shadow-sm transition"
                >Description includes "suspicious"</button>
                <button
                  onClick={() => setBuilder({ field: 'status', operator: '==', value: 'IN_REVIEW' })}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 bg-white/70 hover:bg-gray-100 shadow-sm transition"
                >Status == IN_REVIEW</button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Öncelik</label>
              <input
                type="number"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}
                className="dashboard-input w-full"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="active"
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              <label htmlFor="active" className="text-sm text-gray-700">Aktif</label>
            </div>
          </div>
          <button
            onClick={handleCreate}
            disabled={submitting}
            className="dashboard-add-btn mt-4 inline-flex items-center gap-2"
          >
            <Save className={`w-5 h-5 ${submitting ? 'animate-spin' : ''}`} />
            Kaydet
          </button>
        </div>

        {/* Rules List */}
        <div className="dashboard-form-card">
          {loading ? (
            <div className="text-center py-8 text-gray-600">Yükleniyor...</div>
          ) : rules.length === 0 ? (
            <div className="text-center py-10 text-gray-600">Henüz kural yok</div>
          ) : (
            <div className="space-y-3">
              {rules.map((rule) => {
                let cond: any = null
                try { cond = JSON.parse(rule.condition) } catch {}
                const scoreChip = rule.score >= 0 ? `+${rule.score}` : `${rule.score}`
                const scoreClass = rule.score >= 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                return (
                  <div key={rule.id} className="p-4 border rounded-lg bg-white/90">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900 truncate max-w-[40ch]">{rule.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${rule.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{rule.isActive ? 'Aktif' : 'Pasif'}</span>
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Prio {rule.priority}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${scoreClass}`}>{scoreChip}</span>
                        </div>
                        {rule.description && (
                          <p className="text-gray-600 text-sm mb-2 break-words">{rule.description}</p>
                        )}
                        {cond && (
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] px-2 py-1 bg-gray-100 text-gray-800 rounded-full">field: <b>{cond.field}</b></span>
                            <span className="text-[11px] px-2 py-1 bg-gray-100 text-gray-800 rounded-full">op: <b>{cond.operator}</b></span>
                            <span className="text-[11px] px-2 py-1 bg-gray-100 text-gray-800 rounded-full">value: <b>{String(cond.value)}</b></span>
                            <button
                              onClick={() => setExpandedRuleId(expandedRuleId === rule.id ? null : rule.id)}
                              className="text-[11px] px-2 py-1 border border-gray-200 rounded-full hover:bg-gray-50"
                            >{expandedRuleId === rule.id ? 'Detayı Gizle' : 'Detay'}</button>
                          </div>
                        )}
                        {expandedRuleId === rule.id && cond && (
                          <pre className="mt-2 text-xs bg-gray-50 p-2 rounded border overflow-auto max-w-[70ch]">{JSON.stringify(cond, null, 2)}</pre>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          onClick={() => updatePriority(rule, +1)}
                          className="px-3 py-1.5 text-xs rounded-lg border border-blue-200 text-blue-700 bg-white/70 shadow-sm hover:bg-gray-100 transition"
                        >+ prio</button>
                        <button
                          onClick={() => updatePriority(rule, -1)}
                          className="px-3 py-1.5 text-xs rounded-lg border border-blue-200 text-blue-700 bg-white/70 shadow-sm hover:bg-gray-100 transition"
                        >- prio</button>
                        <button
                          onClick={() => toggleActive(rule)}
                          className={`px-3 py-1.5 text-xs rounded-lg inline-flex items-center gap-1 shadow-sm transition ${rule.isActive ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'}`}
                        >
                          {rule.isActive ? (<>
                            <XCircle className="w-4 h-4" /> Pasif Yap
                          </>) : (<>
                            <CheckCircle2 className="w-4 h-4" /> Aktif Yap
                          </>)}
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
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


