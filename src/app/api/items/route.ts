import { NextResponse } from "next/server"
import { prisma } from "../../../../lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { calculateRiskByRules } from "../../../../lib/rules"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userEmail = session.user?.email
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

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

    // 3) Rule motoru ile risk skoru hesapla (aktif kurallar)
    const newRiskScore = await calculateRiskByRules(item)

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
