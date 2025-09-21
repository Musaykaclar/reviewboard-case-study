import { NextRequest, NextResponse } from "next/server"
import { prisma } from "../../../../lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { calculateRiskByRules } from "../../../../lib/rules"
import type { Item, Status } from "@prisma/client"

/**
 * GET /api/items - Tüm itemları getir
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const items = await prisma.item.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error("Fetch items error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * POST /api/items - Yeni item oluştur
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const { title, description, amount, tags } = data

    if (!title || !amount) {
      return NextResponse.json({ error: "Title ve amount gerekli" }, { status: 400 })
    }

    const numericAmount = parseFloat(amount)
    if (isNaN(numericAmount) || numericAmount < 0) {
      return NextResponse.json({ error: "Geçerli bir tutar girin" }, { status: 400 })
    }

    const newItem = await prisma.item.create({
      data: {
        title,
        description: description || "",
        amount: numericAmount,
        tags: tags || [],
        userId: session.user.id,
        status: "NEW" as Status,
        riskScore: 0,
      },
    })

    // Risk skorunu hesapla
    const riskScore = await calculateRiskByRules(newItem)
    const finalItem = await prisma.item.update({
      where: { id: newItem.id },
      data: { riskScore },
    })

    // Audit log
    await prisma.audit.create({
      data: {
        action: "ITEM_CREATED",
        field: null,
        oldValue: null,
        newValue: finalItem.title,
        itemId: finalItem.id,
        userId: session.user.id,
      },
    })

    return NextResponse.json(finalItem, { status: 201 })
  } catch (error) {
    console.error("Create item error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

