import { NextResponse } from "next/server"
import { prisma } from "../../../../../lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { Status } from "@prisma/client"

// GET - Tek item detayını getir
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const itemId = params.id

    const item = await prisma.item.findUnique({
      where: { id: itemId },
    })

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    // Kullanıcının item'ına erişimi var mı kontrol et
    if (item.userId !== session.user?.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json(item)

  } catch (error) {
    console.error("Get item error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PATCH - Item'ı güncelle (status değiştirme için)
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const itemId = params.id
    const { status, title, description, amount, tags } = await req.json()

    // Item'ı bul
    const existingItem = await prisma.item.findUnique({
      where: { id: itemId },
    })

    if (!existingItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    // Kullanıcının item'ına erişimi var mı kontrol et
    if (existingItem.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Güncellenecek veriyi hazırla
    const updateData: any = {}
    
    if (status !== undefined) {
      updateData.status = status as Status
    }
    if (title !== undefined) {
      updateData.title = title
    }
    if (description !== undefined) {
      updateData.description = description
    }
    if (amount !== undefined) {
      updateData.amount = parseFloat(amount)
    }
    if (tags !== undefined) {
      updateData.tags = tags
    }

    // Item'ı güncelle
    const updatedItem = await prisma.item.update({
      where: { id: itemId },
      data: updateData,
    })

    // Audit log oluştur
    for (const [field, newValue] of Object.entries(updateData)) {
      const oldValue = existingItem[field as keyof typeof existingItem]
      
      await prisma.audit.create({
        data: {
          action: 'ITEM_UPDATED',
          field: field,
          oldValue: oldValue ? String(oldValue) : null,
          newValue: newValue ? String(newValue) : null,
          itemId: itemId,
          userId: session.user.id,
        },
      })
    }

    return NextResponse.json(updatedItem)

  } catch (error) {
    console.error("Update item error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE - Item'ı sil
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const itemId = params.id

    // Item'ı bul
    const item = await prisma.item.findUnique({
      where: { id: itemId },
    })

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    // Kullanıcının item'ına erişimi var mı kontrol et
    if (item.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Item'ı sil
    await prisma.item.delete({
      where: { id: itemId },
    })

    // Audit log oluştur
    await prisma.audit.create({
      data: {
        action: 'ITEM_DELETED',
        field: null,
        oldValue: item.title,
        newValue: null,
        itemId: itemId,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Delete item error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
