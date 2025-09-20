import { NextRequest, NextResponse } from "next/server"
import { prisma } from "../../../../lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { calculateRiskByRules } from "../../../../lib/rules"
import type { Item } from "@prisma/client"

/**
 * GET /api/items/[id]
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const items = await prisma.item.findMany({
      where: { userId: session.user?.id },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error("Fetch items error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * PATCH /api/items/[id]
 */
export async function PATCH(
  request: NextRequest,
  context: { params?: { id?: string | string[] } }
) {
  try {
    const rawId = context.params?.id
    if (!rawId) {
      return NextResponse.json({ error: "Item ID not provided" }, { status: 400 })
    }
    const id = Array.isArray(rawId) ? rawId.join('/') : rawId

    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const oldItem = await prisma.item.findUnique({ where: { id } })
    if (!oldItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    // Güncelleme
    const updatedItem = await prisma.item.update({
      where: { id },
      data: {
        title: data.title ?? oldItem.title,
        description: data.description ?? oldItem.description,
        amount: data.amount !== undefined ? parseFloat(data.amount) : oldItem.amount,
        tags: data.tags ?? oldItem.tags,
      },
    })

    // Audit log (değişen alanlar)
    const changedFields: (keyof Item)[] = ["title", "description", "amount", "tags"]
    for (const field of changedFields) {
      if (JSON.stringify(oldItem[field]) !== JSON.stringify(updatedItem[field])) {
        await prisma.audit.create({
          data: {
            action: "ITEM_UPDATED",
            field,
            oldValue: String(oldItem[field]),
            newValue: String(updatedItem[field]),
            itemId: id,
            userId: session.user.id,
          },
        })
      }
    }

    // Risk skoru yeniden hesapla
    const newRiskScore = await calculateRiskByRules(updatedItem)
    if (newRiskScore !== updatedItem.riskScore) {
      const finalItem = await prisma.item.update({
        where: { id },
        data: { riskScore: newRiskScore },
      })

      await prisma.audit.create({
        data: {
          action: "RISK_SCORE_CALCULATED",
          field: "riskScore",
          oldValue: String(updatedItem.riskScore),
          newValue: String(newRiskScore),
          itemId: id,
          userId: session.user.id,
        },
      })

      return NextResponse.json(finalItem)
    }

    return NextResponse.json(updatedItem)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

/**
 * DELETE /api/items/[id]
 */
export async function DELETE(
  request: NextRequest,
  context: { params?: { id?: string | string[] } }
) {
  try {
    const rawId = context.params?.id
    if (!rawId) {
      return NextResponse.json({ error: "Item ID not provided" }, { status: 400 })
    }
    const id = Array.isArray(rawId) ? rawId.join('/') : rawId

    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const item = await prisma.item.findUnique({ where: { id } })
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    await prisma.item.delete({ where: { id } })

    await prisma.audit.create({
      data: {
        action: "ITEM_DELETED",
        field: null,
        oldValue: item.title,
        newValue: null,
        itemId: id,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
