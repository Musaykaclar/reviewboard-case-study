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

    // URL parametrelerini al
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const action = searchParams.get('action')
    const itemId = searchParams.get('itemId')

    // Kullanıcının item'larını bul
    const userItems = await prisma.item.findMany({
      where: {
        userId: session.user?.id,
      },
      select: { id: true },
    })

    const userItemIds = userItems.map(item => item.id)

    // Filtreleri hazırla
    const whereClause: Record<string, unknown> = {
      itemId: {
        in: userItemIds,
      },
    }

    if (action) {
      whereClause.action = action
    }

    if (itemId) {
      whereClause.itemId = itemId
    }

    // Audit logları çek (kullanıcının item'larına ait olanlar)
    const audits = await prisma.audit.findMany({
      where: whereClause,
      include: {
        item: {
          select: {
            id: true,
            title: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    })

    // Toplam sayıyı al
    const total = await prisma.audit.count({
      where: whereClause,
    })

    return NextResponse.json({
      audits,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })

  } catch (error) {
    console.error("Get audits error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
