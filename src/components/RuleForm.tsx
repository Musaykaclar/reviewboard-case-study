"use client"

import { Plus, Save } from "lucide-react"
import { CSS_CLASSES, RULE_FIELD_TYPES, OPERATOR_OPTIONS } from "../constants"
import { useRules } from "../hooks/useRules"

export default function RuleForm() {
  const {
    form,
    builder,
    submitting,
    error,
    setForm,
    setBuilder,
    createRule,
    clearError,
  } = useRules()

  const handleSubmit = async () => {
    const success = await createRule()
    if (success) {
      // Form temizlenecek (useRules hook'unda handle ediliyor)
    }
  }

  const handleFormChange = (field: string, value: string | number | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (error) clearError()
  }

  const handleBuilderChange = (field: string, value: string | number) => {
    setBuilder(prev => ({ ...prev, [field]: value }))
    if (error) clearError()
  }

  const handleFieldChange = (field: string) => {
    const operators = OPERATOR_OPTIONS[field as keyof typeof OPERATOR_OPTIONS]
    const newBuilder = {
      field,
      operator: operators[0],
      value: field === RULE_FIELD_TYPES.AMOUNT ? 5000 : ''
    }
    setBuilder(newBuilder)
  }

  return (
    <div className={CSS_CLASSES.DASHBOARD_FORM_CARD}>
      <h2 className={`${CSS_CLASSES.DASHBOARD_FORM_TITLE} flex items-center gap-2`}>
        <Plus className="w-5 h-5" /> Yeni Kural Ekle
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Rule Builder */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Alan</label>
          <select
            className={`${CSS_CLASSES.DASHBOARD_INPUT} w-full`}
            value={builder.field}
            onChange={(e) => handleFieldChange(e.target.value)}
          >
            {Object.values(RULE_FIELD_TYPES).map(field => (
              <option key={field} value={field}>{field}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Operatör</label>
          <select
            className={`${CSS_CLASSES.DASHBOARD_INPUT} w-full`}
            value={builder.operator}
            onChange={(e) => handleBuilderChange('operator', e.target.value)}
          >
            {OPERATOR_OPTIONS[builder.field as keyof typeof OPERATOR_OPTIONS]?.map(op => (
              <option key={op} value={op}>{op}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Değer</label>
          {builder.field === RULE_FIELD_TYPES.AMOUNT ? (
            <div className="grid grid-cols-5 gap-3 items-center">
              <input
                className={`${CSS_CLASSES.DASHBOARD_INPUT} col-span-3`}
                type="number"
                value={builder.value as number}
                onChange={(e) => handleBuilderChange('value', Number(e.target.value))}
              />
              <input
                className="col-span-2"
                type="range"
                min={0}
                max={20000}
                step={100}
                value={Number(builder.value) || 0}
                onChange={(e) => handleBuilderChange('value', Number(e.target.value))}
              />
            </div>
          ) : builder.field === RULE_FIELD_TYPES.STATUS ? (
            <div className="flex flex-wrap gap-3">
              {['NEW','IN_REVIEW','APPROVED','REJECTED'].map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleBuilderChange('value', s)}
                  className={`px-3 py-1.5 rounded-lg border text-sm shadow-sm transition ${
                    builder.value === s 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-transparent' 
                      : 'border-gray-200 text-gray-700 bg-white/70 hover:bg-gray-100'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          ) : (
            <input
              className={`${CSS_CLASSES.DASHBOARD_INPUT} w-full`}
              type="text"
              value={builder.value as string}
              onChange={(e) => handleBuilderChange('value', e.target.value)}
              placeholder={builder.field === RULE_FIELD_TYPES.TAGS ? 'ör. urgent' : 'ör. suspicious / invoice'}
            />
          )}
        </div>
      </div>

      {/* Rule Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ad</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleFormChange('name', e.target.value)}
            className={`${CSS_CLASSES.DASHBOARD_INPUT} w-full`}
            placeholder="Örn: Yüksek Tutar"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Skor (+)</label>
          <input
            type="number"
            value={form.score}
            onChange={(e) => handleFormChange('score', Number(e.target.value))}
            className={`${CSS_CLASSES.DASHBOARD_INPUT} w-full`}
            placeholder="Örn: 20"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Açıklama</label>
          <input
            type="text"
            value={form.description}
            onChange={(e) => handleFormChange('description', e.target.value)}
            className={`${CSS_CLASSES.DASHBOARD_INPUT} w-full`}
            placeholder="Opsiyonel"
          />
        </div>

        

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Öncelik</label>
          <input
            type="number"
            value={form.priority}
            onChange={(e) => handleFormChange('priority', Number(e.target.value))}
            className={`${CSS_CLASSES.DASHBOARD_INPUT} w-full`}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="active"
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => handleFormChange('isActive', e.target.checked)}
          />
          <label htmlFor="active" className="text-sm text-gray-700">Aktif</label>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className={`${CSS_CLASSES.DASHBOARD_ADD_BTN} mt-4 inline-flex items-center gap-2`}
      >
        <Save className={`w-5 h-5 ${submitting ? 'animate-spin' : ''}`} />
        Kaydet
      </button>
    </div>
  )
}
