import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Invitation from '@/models/Invitation'
import { requireAuth } from '@/lib/auth'

// DELETE /api/invitations/[id] — revoke a single invitation
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  requireAuth(req, 'admin')
  try {
    await connectDB()
    const { id } = await params
    const deleted = await Invitation.findByIdAndDelete(id)

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Invitation not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: { id } })
  } catch (error) {
    console.error('DELETE /api/invitations/[id] error:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete invitation' }, { status: 500 })
  }
}
