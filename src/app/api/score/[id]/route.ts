import { NextRequest, NextResponse } from "next/server"
import { prisma } from "../../../../../lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { calculateRiskByRules } from "../../../../../lib/rules"

// POST - Risk score hesapla ve güncelle
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id: itemId } = await context.params
    const item = await prisma.item.findUnique({ where: { id: itemId } })
    if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 })
    if (item.userId !== session.user?.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const newRiskScore = await calculateRiskByRules(item)
    const updatedItem = await prisma.item.update({ where: { id: itemId }, data: { riskScore: newRiskScore } })

    await prisma.audit.create({
      data: {
        action: 'RISK_SCORE_CALCULATED',
        field: 'riskScore',
        oldValue: item.riskScore.toString(),
        newValue: newRiskScore.toString(),
        itemId,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ success: true, item: updatedItem, riskScore: newRiskScore })
  } catch (error) {
    console.error("Risk score calculation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET - Mevcut risk score'u döndür
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id: itemId } = await context.params
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      select: { id: true, title: true, riskScore: true, status: true, amount: true, tags: true, userId: true },
    })
    if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 })
    if (item.userId !== session.user?.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    return NextResponse.json({ item, riskLevel: getRiskLevel(item.riskScore) })
  } catch (error) {
    console.error("Get risk score error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function getRiskLevel(score: number): string {
  if (score >= 80) return 'HIGH'
  if (score >= 50) return 'MEDIUM'
  if (score >= 20) return 'LOW'
  return 'VERY_LOW'
}