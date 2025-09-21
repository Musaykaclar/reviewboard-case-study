"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import { Item, Status } from "@prisma/client"
import { 
  ArrowLeft, 
  Package, 
  DollarSign, 
  Tag, 
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw
} from "lucide-react"

export default function ItemDetailPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const itemId = params.id as string
  
  const [item, setItem] = useState<Item | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusLoading, setStatusLoading] = useState(false)
  const [scoreLoading, setScoreLoading] = useState(false)

  // Item detaylarını çek
  const fetchItem = async () => {
    try {
      const res = await fetch(`/api/items/${itemId}`)
      if (res.ok) {
        const data = await res.json()
        setItem(data)
      } else {
        console.error('Item not found')
      }
    } catch (error) {
      console.error('Error fetching item:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (itemId) {
      fetchItem()
    }
  }, [itemId, fetchItem])

  // Status değiştirme
  const handleStatusChange = async (newStatus: Status) => {
    if (!item) return
    
    setStatusLoading(true)
    try {
      const res = await fetch(`/api/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      
      if (res.ok) {
        const updatedItem = await res.json()
        setItem(updatedItem)
      }
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setStatusLoading(false)
    }
  }

  // Risk score hesapla
  const calculateRiskScore = async () => {
    if (!item) return
    
    setScoreLoading(true)
    try {
      const res = await fetch(`/api/score/${itemId}`, {
        method: 'POST',
      })
      
      if (res.ok) {
        const data = await res.json()
        setItem({ ...item, riskScore: data.riskScore })
      }
    } catch (error) {
      console.error('Error calculating risk score:', error)
    } finally {
      setScoreLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="dashboard-no-session">
        <div className="text-center">
          <Package style={{ width: '64px', height: '64px', margin: '0 auto 1rem' }} />
          <p>Giriş yapmanız gerekiyor</p>
        </div>
      </div>
    )
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

  if (!item) {
    return (
      <div className="dashboard-container">
        <div className="flex flex-col items-center justify-center min-h-screen text-white">
          <Package style={{ width: '64px', height: '64px', margin: '0 auto 1rem' }} />
          <h2 className="text-2xl font-bold mb-2">Item Bulunamadı</h2>
          <p className="text-gray-300 mb-4">Aradığınız item mevcut değil.</p>
          <button
            onClick={() => router.push('/dashboard/items')}
            className="dashboard-add-btn"
          >
            <ArrowLeft style={{ width: '20px', height: '20px' }} />
            Geri Dön
          </button>
        </div>
      </div>
    )
  }

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-500'
    if (score >= 50) return 'text-yellow-500'
    if (score >= 20) return 'text-blue-500'
    return 'text-green-500'
  }

  const getRiskLevel = (score: number) => {
    if (score >= 80) return 'Yüksek Risk'
    if (score >= 50) return 'Orta Risk'
    if (score >= 20) return 'Düşük Risk'
    return 'Çok Düşük Risk'
  }

  const getStatusColor = (status: Status) => {
    switch (status) {
      case 'NEW': return 'bg-blue-100 text-blue-800'
      case 'IN_REVIEW': return 'bg-yellow-100 text-yellow-800'
      case 'APPROVED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: Status) => {
    switch (status) {
      case 'NEW': return <Package className="w-4 h-4" />
      case 'IN_REVIEW': return <Clock className="w-4 h-4" />
      case 'APPROVED': return <CheckCircle className="w-4 h-4" />
      case 'REJECTED': return <XCircle className="w-4 h-4" />
      default: return <Package className="w-4 h-4" />
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

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="dashboard-form-card mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard/items')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h1 className="dashboard-form-title flex items-center gap-2">
                  <Package className="w-6 h-6" />
                  {item.title}
                </h1>
                <p className="text-gray-600">Item Detayları</p>
              </div>
            </div>
            <button
              onClick={calculateRiskScore}
              disabled={scoreLoading}
              className="dashboard-add-btn flex items-center gap-2"
            >
              <RefreshCw className={`w-5 h-5 ${scoreLoading ? 'animate-spin' : ''}`} />
              Risk Hesapla
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sol kolon - Item bilgileri */}
          <div className="lg:col-span-2 space-y-6">
            {/* Temel Bilgiler */}
            <div className="dashboard-form-card">
              <h2 className="dashboard-form-title">Temel Bilgiler</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Başlık
                  </label>
                  <p className="text-gray-900 font-medium">{item.title}</p>
                </div>
                {item.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Açıklama
                    </label>
                    <p className="text-gray-700">{item.description}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tutar
                  </label>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-gray-600" />
                    <span className="text-lg font-semibold text-gray-900">
                      {item.amount.toLocaleString('tr-TR', { 
                        style: 'currency', 
                        currency: 'TRY' 
                      })}
                    </span>
                  </div>
                </div>
                {item.tags && item.tags.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Etiketler
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          <Tag className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Risk Analizi */}
            <div className="dashboard-form-card">
              <h2 className="dashboard-form-title flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Risk Analizi
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Risk Skoru:</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-bold ${getRiskColor(item.riskScore)}`}>
                      {item.riskScore}
                    </span>
                    <span className="text-gray-500">/100</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Risk Seviyesi:</span>
                  <span className={`font-semibold ${getRiskColor(item.riskScore)}`}>
                    {getRiskLevel(item.riskScore)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      item.riskScore >= 80 ? 'bg-red-500' :
                      item.riskScore >= 50 ? 'bg-yellow-500' :
                      item.riskScore >= 20 ? 'bg-blue-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${item.riskScore}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Sağ kolon - Status ve işlemler */}
          <div className="space-y-6">
            {/* Mevcut Status */}
            <div className="dashboard-form-card">
              <h2 className="dashboard-form-title">Mevcut Durum</h2>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className={`p-2 rounded-full ${getStatusColor(item.status)}`}>
                  {getStatusIcon(item.status)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {item.status === 'NEW' ? 'Yeni' :
                     item.status === 'IN_REVIEW' ? 'İnceleniyor' :
                     item.status === 'APPROVED' ? 'Onaylandı' :
                     'Reddedildi'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(item.updatedAt).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </div>
            </div>

            {/* Status Değiştir */}
            <div className="dashboard-form-card">
              <h2 className="dashboard-form-title">Durum Değiştir</h2>
              <div className="space-y-3">
                <button
                  onClick={() => handleStatusChange('NEW')}
                  disabled={statusLoading || item.status === 'NEW'}
                  className="w-full flex items-center gap-3 p-3 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Package className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-900">Yeni</span>
                </button>
                <button
                  onClick={() => handleStatusChange('IN_REVIEW')}
                  disabled={statusLoading || item.status === 'IN_REVIEW'}
                  className="w-full flex items-center gap-3 p-3 border border-yellow-200 rounded-lg hover:bg-yellow-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <span className="text-yellow-900">İnceleniyor</span>
                </button>
                <button
                  onClick={() => handleStatusChange('APPROVED')}
                  disabled={statusLoading || item.status === 'APPROVED'}
                  className="w-full flex items-center gap-3 p-3 border border-green-200 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-900">Onayla</span>
                </button>
                <button
                  onClick={() => handleStatusChange('REJECTED')}
                  disabled={statusLoading || item.status === 'REJECTED'}
                  className="w-full flex items-center gap-3 p-3 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span className="text-red-900">Reddet</span>
                </button>
              </div>
            </div>

            {/* Tarih Bilgileri */}
            <div className="dashboard-form-card">
              <h2 className="dashboard-form-title">Tarih Bilgileri</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Oluşturuldu:</span>
                  <span className="text-gray-900">
                    {new Date(item.createdAt).toLocaleDateString('tr-TR')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Güncellendi:</span>
                  <span className="text-gray-900">
                    {new Date(item.updatedAt).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
