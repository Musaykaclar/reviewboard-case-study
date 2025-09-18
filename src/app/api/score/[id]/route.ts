import { NextResponse } from "next/server"
import { prisma } from "../../../../../lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// Basit risk skoru hesaplama (if-else kuralları)
function calculateRiskScore(item: any): number {
  let risk = 0

  // amount kuralı
  if (item.amount > 10000) risk = 80
  else if (item.amount > 5000) risk = 50
  else risk = 20

  // tag kuralları
  const tags: string[] = Array.isArray(item.tags) ? item.tags.map((t: string) => String(t).toLowerCase()) : []
  if (tags.includes('urgent')) risk += 20
  if (tags.includes('fraud')) risk = 100
  if (tags.includes('trusted')) risk -= 20

  // description kuralları (opsiyonel)
  const desc = String(item.description || '').toLowerCase()
  if (desc.includes('suspicious')) risk += 30
  if (desc.includes('verified')) risk -= 10

  // 0-100 aralığı
  if (risk < 0) risk = 0
  if (risk > 100) risk = 100
  return risk
}

// POST - Risk score hesapla ve güncelle
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const itemId = params.id

    // Item'ı bul
    const item = await prisma.item.findUnique({
      where: { id: itemId },
    })

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    // Kullanıcının item'ına erişimi var mı kontrol et
    if (item.userId !== session.user?.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Risk score hesapla (basit kural motoru)
    const newRiskScore = calculateRiskScore(item)

    // Item'ı güncelle
    const updatedItem = await prisma.item.update({
      where: { id: itemId },
      data: { riskScore: newRiskScore },
    })

    // Audit log oluştur
    await prisma.audit.create({
      data: {
        action: 'RISK_SCORE_CALCULATED',
        field: 'riskScore',
        oldValue: item.riskScore.toString(),
        newValue: newRiskScore.toString(),
        itemId: itemId,
        userId: session.user.id,
      },
    })

    return NextResponse.json({
      success: true,
      item: updatedItem,
      riskScore: newRiskScore,
    })

  } catch (error) {
    console.error("Risk score calculation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// GET - Mevcut risk score'u döndür
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const itemId = params.id

    const item = await prisma.item.findUnique({
      where: { id: itemId },
      select: {
        id: true,
        title: true,
        riskScore: true,
        status: true,
        amount: true,
        tags: true,
      userId: true,
      },
    })

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    if (item.userId !== session.user?.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json({
      item,
      riskLevel: getRiskLevel(item.riskScore),
    })

  } catch (error) {
    console.error("Get risk score error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Risk level belirleme fonksiyonu
function getRiskLevel(score: number): string {
  if (score >= 80) return 'HIGH'
  if (score >= 50) return 'MEDIUM'
  if (score >= 20) return 'LOW'
  return 'VERY_LOW'
}
