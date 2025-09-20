import { NextResponse } from "next/server"
import { prisma } from "../../../../lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// GET /api/rules - aktif/pasif tüm kuralları döndür
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const rules = await prisma.rule.findMany({
      where: {
        OR: [
          { userId: session.user?.id }, // Kullanıcının kendi kuralları
          { userId: null } // Global kurallar (geriye dönük uyumluluk)
        ]
      },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    })

    return NextResponse.json({ rules })
  } catch (error) {
    console.error("Get rules error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/rules - yeni kural oluştur
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, description, condition, score, isActive = true, priority = 0 } = await req.json()

    if (!name || !condition || typeof score !== 'number') {
      return NextResponse.json({ error: "name, condition, score zorunlu" }, { status: 400 })
    }

    // condition JSON doğrulama + alan/operatör kontrolü
    let parsed: Record<string, unknown>
    try {
      parsed = JSON.parse(condition)
      if (!parsed || typeof parsed !== 'object') throw new Error('invalid')
    } catch {
      return NextResponse.json({ error: "condition geçerli bir JSON olmalı" }, { status: 400 })
    }

    const allowedFields = ["amount", "tags", "description", "status", "title"]
    if (!allowedFields.includes(String(parsed.field))) {
      return NextResponse.json({ error: "field geçersiz. Geçerli: amount,tags,description,status,title" }, { status: 400 })
    }

    const field = parsed.field as string
    const operator = parsed.operator as string

    const numericOps = [">", ">=", "<", "<=", "=="]
    const textOps = ["includes", "contains"]

    if (field === 'amount' && !numericOps.includes(operator)) {
      return NextResponse.json({ error: "amount için operator: >,>=,<,<=,==" }, { status: 400 })
    }
    if ((field === 'description' || field === 'title') && !textOps.includes(operator) && operator !== '==') {
      return NextResponse.json({ error: `${field} için operator: includes, contains veya ==` }, { status: 400 })
    }
    if (field === 'tags' && !textOps.includes(operator)) {
      return NextResponse.json({ error: 'tags için operator: includes veya contains' }, { status: 400 })
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

    const rule = await prisma.rule.create({
      data: { 
        name, 
        description, 
        condition, 
        score, 
        isActive, 
        priority,
        userId: session.user?.id 
      },
    })

    return NextResponse.json(rule, { status: 201 })
  } catch (error) {
    console.error("Create rule error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


