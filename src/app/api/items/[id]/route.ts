import { NextRequest, NextResponse } from "next/server"
import { prisma } from "../../../../../lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { calculateRiskByRules } from "../../../../../lib/rules"
import { Status } from "@prisma/client"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const params = await context.params
    const { id: itemId } = params

    const item = await prisma.item.findUnique({ where: { id: itemId } })
    if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 })

    if (item.userId !== session.user?.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    return NextResponse.json(item)
  } catch (error) {
    console.error("Get item error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const params = await context.params
    const { id: itemId } = params
    const { status, title, description, amount, tags } = await request.json()

    const existingItem = await prisma.item.findUnique({ where: { id: itemId } })
    if (!existingItem) return NextResponse.json({ error: "Item not found" }, { status: 404 })
    if (existingItem.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const updateData: Record<string, unknown> = {}
    if (status !== undefined) updateData.status = status as Status
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (amount !== undefined) updateData.amount = parseFloat(amount)
    if (tags !== undefined) updateData.tags = tags

    const updatedItem = await prisma.item.update({ where: { id: itemId }, data: updateData })

    // Audit log for changed fields
    for (const [field, newValue] of Object.entries(updateData)) {
      const oldValue = existingItem[field as keyof typeof existingItem]
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        await prisma.audit.create({
          data: {
            action: 'ITEM_UPDATED',
            field,
            oldValue: oldValue ? String(oldValue) : null,
            newValue: newValue ? String(newValue) : null,
            itemId,
            userId: session.user.id,
          },
        })
      }
    }

    // Risk skorunu yeniden hesapla
    const newRiskScore = await calculateRiskByRules(updatedItem)
    if (newRiskScore !== updatedItem.riskScore) {
      const finalItem = await prisma.item.update({
        where: { id: itemId },
        data: { riskScore: newRiskScore },
      })

      await prisma.audit.create({
        data: {
          action: "RISK_SCORE_CALCULATED",
          field: "riskScore",
          oldValue: String(updatedItem.riskScore),
          newValue: String(newRiskScore),
          itemId,
          userId: session.user.id,
        },
      })

      return NextResponse.json(finalItem)
    }

    return NextResponse.json(updatedItem)
  } catch (error) {
    console.error("Update item error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const params = await context.params
    const { id: itemId } = params

    const item = await prisma.item.findUnique({ where: { id: itemId } })
    if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 })
    if (item.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    await prisma.item.delete({ where: { id: itemId } })

    await prisma.audit.create({
      data: {
        action: 'ITEM_DELETED',
        field: null,
        oldValue: item.title,
        newValue: null,
        itemId,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete item error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}