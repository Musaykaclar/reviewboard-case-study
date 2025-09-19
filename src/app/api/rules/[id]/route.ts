import { NextResponse } from "next/server"
import { prisma } from "../../../../../lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// PATCH /api/rules/:id - kural güncelle
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = params.id
    const data = await req.json()

    if (data.condition !== undefined) {
      let parsed: any
      try {
        parsed = JSON.parse(data.condition)
        if (!parsed || typeof parsed !== 'object') throw new Error('invalid')
      } catch {
        return NextResponse.json({ error: "condition geçerli bir JSON olmalı" }, { status: 400 })
      }

      const allowedFields = ["amount", "tags", "description", "status", "title"]
      if (!allowedFields.includes(parsed.field)) {
        return NextResponse.json({ error: "field geçersiz. Geçerli: amount,tags,description,status,title" }, { status: 400 })
      }

      const field = parsed.field as string
      const operator = parsed.operator as string

      const numericOps = [">", ">=", "<", "<=", "=="]
      const textOps = ["includes", "contains"]

      if (field === 'amount' && !numericOps.includes(operator)) {
        return NextResponse.json({ error: "amount için operator: >,>=,<,<=,==" }, { status: 400 })
      }
      if ((field === 'description' || field === 'title' || field === 'tags') && !textOps.includes(operator) && !(field !== 'tags' && operator === '==')) {
        return NextResponse.json({ error: `${field} için operator: includes veya contains` }, { status: 400 })
      }
      if (field === 'status') {
        const statuses = ["NEW", "IN_REVIEW", "APPROVED", "REJECTED"]
        if (operator !== '==') {
          return NextResponse.json({ error: "status için operator: ==" }, { status: 400 })
        }
        if (!statuses.includes(String(parsed.value))) {
          return NextResponse.json({ error: "status değeri NEW, IN_REVIEW, APPROVED veya REJECTED olmalı" }, { status: 400 })
        }
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
        priority: data.priority,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Update rule error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/rules/:id - kural sil
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = params.id

    await prisma.rule.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete rule error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


