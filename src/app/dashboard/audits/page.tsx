"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Audit } from "@prisma/client"
import { 
  History, 
  User, 
  Package, 
  Calendar,
  ArrowUpDown,
  Filter,
  Search
} from "lucide-react"

interface AuditWithDetails extends Audit {
  item?: {
    id: string
    title: string
  }
  user?: {
    id: string
    name: string
    email: string
  }
}

export default function AuditsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [audits, setAudits] = useState<AuditWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [actionFilter, setActionFilter] = useState("")

  // Audit logları çek
  const fetchAudits = async () => {
    try {
      const res = await fetch("/api/audits")
      if (res.ok) {
        const data = await res.json()
        // API { audits, pagination } döndürüyor; geriye dönük uyumluluk için fallback
        setAudits(Array.isArray(data) ? data : (data.audits ?? []))
      }
    } catch (error) {
      console.error('Error fetching audits:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAudits()
  }, [])

  if (!session) {
    return (
      <div className="dashboard-no-session">
        <div className="text-center">
          <History style={{ width: '64px', height: '64px', margin: '0 auto 1rem' }} />
          <p>Giriş yapmanız gerekiyor</p>
        </div>
      </div>
    )
  }

  // Filtreleme
  const filteredAudits = audits.filter(audit => {
    const matchesSearch = searchTerm === "" || 
      audit.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      audit.item?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      audit.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesAction = actionFilter === "" || audit.action === actionFilter
    
    return matchesSearch && matchesAction
  })

  const getActionColor = (action: string) => {
    switch (action) {
      case 'ITEM_CREATED':
        return 'bg-green-100 text-green-800'
      case 'ITEM_UPDATED':
        return 'bg-blue-100 text-blue-800'
      case 'ITEM_DELETED':
        return 'bg-red-100 text-red-800'
      case 'RISK_SCORE_CALCULATED':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getActionText = (action: string) => {
    switch (action) {
      case 'ITEM_CREATED':
        return 'Item Oluşturuldu'
      case 'ITEM_UPDATED':
        return 'Item Güncellendi'
      case 'ITEM_DELETED':
        return 'Item Silindi'
      case 'RISK_SCORE_CALCULATED':
        return 'Risk Skoru Hesaplandı'
      default:
        return action
    }
  }

  const getFieldText = (field: string | null) => {
    if (!field) return 'Genel'
    
    switch (field) {
      case 'status':
        return 'Durum'
      case 'title':
        return 'Başlık'
      case 'description':
        return 'Açıklama'
      case 'amount':
        return 'Tutar'
      case 'tags':
        return 'Etiketler'
      case 'riskScore':
        return 'Risk Skoru'
      default:
        return field
    }
  }

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      {/* Renkli background efektleri */}
      <div className="dashboard-background">
        <div className="dashboard-circle-1"></div>
        <div className="dashboard-circle-2"></div>
        <div className="dashboard-circle-3"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="dashboard-form-card mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="dashboard-form-title flex items-center gap-2">
                <History className="w-6 h-6" />
                Audit Log
              </h1>
              <p className="text-gray-600">Tüm sistem değişikliklerini takip edin</p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              Dashboard'a Dön
            </button>
          </div>
        </div>

        {/* Filtreler */}
        <div className="dashboard-form-card mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Arama */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Ara... (işlem, item, kullanıcı)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="dashboard-input w-full pl-10"
                />
              </div>
            </div>
            
            {/* Action filtresi */}
            <div className="md:w-64">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  className="dashboard-input w-full pl-10"
                >
                  <option value="">Tüm İşlemler</option>
                  <option value="ITEM_CREATED">Item Oluşturuldu</option>
                  <option value="ITEM_UPDATED">Item Güncellendi</option>
                  <option value="ITEM_DELETED">Item Silindi</option>
                  <option value="RISK_SCORE_CALCULATED">Risk Skoru Hesaplandı</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Audit Listesi */}
        <div className="dashboard-form-card">
          {filteredAudits.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {audits.length === 0 ? 'Henüz audit kaydı yok' : 'Filtreye uygun kayıt bulunamadı'}
              </h3>
              <p className="text-gray-500">
                {audits.length === 0 
                  ? 'İlk item\'ınızı oluşturduğunuzda burada görünecek.'
                  : 'Farklı arama terimleri deneyin.'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      <div className="flex items-center gap-2">
                        <ArrowUpDown className="w-4 h-4" />
                        İşlem
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Item</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Alan</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Değişiklik</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Kullanıcı</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Tarih</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAudits.map((audit) => (
                    <tr key={audit.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getActionColor(audit.action)}`}>
                          {getActionText(audit.action)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900 font-medium">
                            {audit.item?.title || 'Silinmiş Item'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {getFieldText(audit.field)}
                      </td>
                      <td className="py-4 px-4">
                        {audit.oldValue && audit.newValue ? (
                          <div className="text-sm">
                            <div className="flex items-center gap-2">
                              <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                                {audit.oldValue}
                              </span>
                              <span className="text-gray-400">→</span>
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                {audit.newValue}
                              </span>
                            </div>
                          </div>
                        ) : audit.newValue ? (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                            {audit.newValue}
                          </span>
                        ) : (
                          <span className="text-gray-500 text-sm">-</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900">
                            {audit.user?.name || 'Bilinmeyen'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600 text-sm">
                            {new Date(audit.createdAt).toLocaleDateString('tr-TR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
