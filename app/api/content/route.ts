import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Content from '@/models/content'
import type { IEventContent } from '@/models/content'

// GET /api/content — fetch event content
export async function GET() {
  try {
    await connectDB()
    let content = await Content.findOne().lean()

    // If no content exists, return default content
    if (!content) {
      content = {
        title: 'An Evening of Celebration',
        details: [],
        date: 'Saturday, May 24, 2025',
        time: '7:00 PM Onwards',
        venue: 'The Grand Hall, Colombo',
        dressCode: 'Black Tie Preferred',
        rsvp: 'Kindly RSVP by May 10, 2025',
      } as any
    }

    return NextResponse.json({ success: true, data: content })
  } catch (error) {
    console.error('GET /api/content error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch event content' },
      { status: 500 }
    )
  }
}

// PUT /api/content — update event content
export async function PUT(req: NextRequest) {
  try {
    await connectDB()

    const body = await req.json()
    const { title, details, date, time, venue, dressCode, rsvp } = body

    // Validate input
    if (!title || !rsvp) {
      return NextResponse.json(
        { success: false, error: 'Title and RSVP are required' },
        { status: 400 }
      )
    }

    // Filter out empty details
    const filteredDetails = Array.isArray(details) ? details.filter(detail => detail.label.trim() && detail.value.trim()) : []

    // Find and update or create new content
    let content = await Content.findOneAndUpdate(
      {},
      { title, details: filteredDetails, date, time, venue, dressCode, rsvp },
      { new: true, upsert: true, runValidators: true }
    )

    return NextResponse.json({ success: true, data: content }, { status: 200 })
  } catch (error: unknown) {
    console.error('PUT /api/content error:', error)

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
      { success: false, error: 'Failed to update event content' },
      { status: 500 }
    )
  }
}
