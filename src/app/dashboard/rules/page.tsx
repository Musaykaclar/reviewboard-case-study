"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Settings, ArrowLeft } from "lucide-react"
import { CSS_CLASSES } from "../../../constants"
import { useRules } from "../../../hooks/useRules"
import RuleForm from "../../../components/RuleForm"
import RuleList from "../../../components/RuleList"
import NoSessionMessage from "../../../components/NoSessionMessage"
import "../../globals.css"

export default function RulesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { rules, loading } = useRules()

  if (!session) {
    return (
      <NoSessionMessage
        icon={<Settings style={{ width: '64px', height: '64px', margin: '0 auto 1rem' }} />}
        message="Giriş yapmanız gerekiyor"
      />
    )
  }

  return (
    <div className={CSS_CLASSES.DASHBOARD_CONTAINER}>
      {/* Renkli background efektleri */}
      <div className="dashboard-background">
        <div className="dashboard-circle-1"></div>
        <div className="dashboard-circle-2"></div>
        <div className="dashboard-circle-3"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <div className={`${CSS_CLASSES.DASHBOARD_FORM_CARD} mb-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h1 className={`${CSS_CLASSES.DASHBOARD_FORM_TITLE} flex items-center gap-2`}>
                  <Settings className="w-6 h-6" />
                  Rules
                </h1>
                <p className="text-gray-600">Risk skorunu etkileyen kuralları yönetin</p>
              </div>
            </div>
          </div>
        </div>

        {/* Yeni Kural */}
        <RuleForm />

        {/* Rules List */}
        <div className={CSS_CLASSES.DASHBOARD_FORM_CARD}>
          <RuleList rules={rules} loading={loading} />
        </div>
      </div>
    </div>
  )
}


