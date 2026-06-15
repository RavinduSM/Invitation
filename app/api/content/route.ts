import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Content from '@/models/content'
import { requireAuth } from '@/lib/auth'

// GET /api/content — list all content templates
export async function GET(req: NextRequest) {
  try {
    await connectDB()
    requireAuth(req, 'admin')
    const contents = await Content.find({}).sort({ createdAt: -1 }).lean()

    return NextResponse.json({ success: true, data: contents })
  } catch (error) {
    console.error('GET /api/content error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch content templates' },
      { status: 500 }
    )
  }
}

// POST /api/content — create a new content template
export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const payload = requireAuth(req, 'admin')

    const body = await req.json()
    const { title, details, date, time, venue, dressCode, rsvp } = body

    if (!title || !rsvp) {
      return NextResponse.json(
        { success: false, error: 'Title and RSVP are required' },
        { status: 400 }
      )
    }

    const filteredDetails = Array.isArray(details)
      ? details.filter((detail: { label: string; value: string }) => detail.label.trim() && detail.value.trim())
      : []

    const content = await Content.create({
      title,
      details: filteredDetails,
      date,
      time,
      venue,
      dressCode,
      rsvp,
      createdBy: payload.userId,
    })

    return NextResponse.json({ success: true, data: content }, { status: 201 })
  } catch (error: unknown) {
    console.error('POST /api/content error:', error)

    if (typeof error === 'object' && error !== null && 'name' in error) {
      const err = error as { name: string; message: string }
      if (err.name === 'ValidationError') {
        return NextResponse.json(
          { success: false, error: err.message },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create content template' },
      { status: 500 }
    )
  }
}
