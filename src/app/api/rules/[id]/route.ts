import { NextRequest, NextResponse } from "next/server"
import { prisma } from "../../../../../lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// PATCH /api/rules/:id - kural güncelle
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await context.params
    const data = await request.json()

    const existingRule = await prisma.rule.findUnique({ where: { id } })
    if (!existingRule) return NextResponse.json({ error: "Rule not found" }, { status: 404 })
    if (existingRule.userId && existingRule.userId !== session.user?.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    if (data.condition) {
      let parsed: Record<string, unknown>
      try {
        parsed = JSON.parse(data.condition)
        if (!parsed || typeof parsed !== 'object') throw new Error()
      } catch {
        return NextResponse.json({ error: "condition geçerli bir JSON olmalı" }, { status: 400 })
      }

      const allowedFields = ["amount", "tags", "description", "status", "title"]
      if (!allowedFields.includes(parsed.field as string)) {
        return NextResponse.json({ error: "field geçersiz. Geçerli: amount,tags,description,status,title" }, { status: 400 })
      }
    }

    const updated = await prisma.rule.update({
      where: { id },
      data: { 
        name: data.name, 
        description: data.description, 
        condition: data.condition, 
        score: data.score, 
        isActive: data.isActive, 
        priority: data.priority 
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Update rule error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/rules/:id - kural sil
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await context.params
    const existingRule = await prisma.rule.findUnique({ where: { id } })
    if (!existingRule) return NextResponse.json({ error: "Rule not found" }, { status: 404 })
    if (existingRule.userId && existingRule.userId !== session.user?.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    await prisma.rule.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete rule error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}