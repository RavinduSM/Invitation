import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Invitation from '@/models/Invitation'
import { normalizeName, formatName, getInviteURL } from '@/lib/utils'

// GET /api/invitations — list all invitations
export async function GET() {
  try {
    await connectDB()
    const invitations = await Invitation.find({}).sort({ createdAt: -1 }).lean()
    return NextResponse.json({ success: true, data: invitations })
  } catch (error) {
    console.error('GET /api/invitations error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch invitations' }, { status: 500 })
  }
}

// POST /api/invitations — create a new invitation
export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const body = await req.json()
    const rawName: string = body?.name ?? ''

    if (!rawName.trim()) {
      return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 })
    }

    const normalized = normalizeName(rawName)
    const formatted = formatName(rawName)

    // Check duplicate
    const existing = await Invitation.findOne({ normalizedName: normalized })
    if (existing) {
      return NextResponse.json(
        { success: false, error: `An invitation for "${formatted}" already exists.` },
        { status: 409 }
      )
    }

    const url = getInviteURL(formatted)

    const invitation = await Invitation.create({
      name: formatted,
      normalizedName: normalized,
      url,
    })

    return NextResponse.json({ success: true, data: invitation }, { status: 201 })
  } catch (error: unknown) {
    console.error('POST /api/invitations error:', error)

    // MongoDB duplicate key error
    if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: number }).code === 11000) {
      return NextResponse.json(
        { success: false, error: 'An invitation for this person already exists.' },
        { status: 409 }
      )
    }

    return NextResponse.json({ success: false, error: 'Failed to create invitation' }, { status: 500 })
  }
}
