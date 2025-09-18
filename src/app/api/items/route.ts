import { NextResponse } from "next/server"
import { prisma } from "../../../../lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userEmail = session.user?.email

    const items = await prisma.item.findMany({
      where: {
        user: {
          email: userEmail,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, description, amount, tags } = await req.json()

    if (!title || !amount) {
      return NextResponse.json({ error: "Title ve Amount gerekli" }, { status: 400 })
    }

    // 1) Item'ı oluştur
    const item = await prisma.item.create({
      data: {
        title,
        description,
        amount: parseFloat(amount), // mutlaka number olmalı
        tags: tags || [],
        userId: session.user.id,
      },
    })

    // 2) Audit: ITEM_CREATED
    await prisma.audit.create({
      data: {
        action: 'ITEM_CREATED',
        field: null,
        oldValue: null,
        newValue: title,
        itemId: item.id,
        userId: session.user.id,
      },
    })

    // 3) Basit kural motoru ile risk skoru hesapla
    const simpleCalculateRisk = (createdItem: any): number => {
      let risk = 0
      // amount
      if (createdItem.amount > 10000) risk = 80
      else if (createdItem.amount > 5000) risk = 50
      else risk = 20
      // tags
      const tagsLc: string[] = Array.isArray(createdItem.tags) ? createdItem.tags.map((t: string) => String(t).toLowerCase()) : []
      if (tagsLc.includes('urgent')) risk += 20
      if (tagsLc.includes('fraud')) risk = 100
      if (tagsLc.includes('trusted')) risk -= 20
      // description
      const desc = String(createdItem.description || '').toLowerCase()
      if (desc.includes('suspicious')) risk += 30
      if (desc.includes('verified')) risk -= 10
      // clamp
      if (risk < 0) risk = 0
      if (risk > 100) risk = 100
      return risk
    }

    const newRiskScore = simpleCalculateRisk(item)

    // 4) Item'ı risk skoru ile güncelle
    const updatedItem = await prisma.item.update({
      where: { id: item.id },
      data: { riskScore: newRiskScore },
    })

    // 5) Audit: RISK_SCORE_CALCULATED
    await prisma.audit.create({
      data: {
        action: 'RISK_SCORE_CALCULATED',
        field: 'riskScore',
        oldValue: '0',
        newValue: String(newRiskScore),
        itemId: item.id,
        userId: session.user.id,
      },
    })

    return NextResponse.json(updatedItem)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
