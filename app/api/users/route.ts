import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/user'

// GET /api/users — fetch all users
export async function GET() {
  try {
    await connectDB()
    const users = await User.find().select('-userPwd').lean()

    return NextResponse.json({ success: true, data: users })
  } catch (error) {
    console.error('GET /api/users error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// POST /api/users — create user
export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const body = await req.json()
    const {userName, userEmail, userPwd, userRole} = body

    // Validate input
    if (!userName || !userEmail || !userPwd || !userRole) {
      return NextResponse.json(
        { success: false, error: 'Username, email, password, and role are required' },
        { status: 400 }
      )
    }

    const user =  await User.create({
        userName,
        userEmail,
        userPwd,
        userRole,
    })

    return NextResponse.json({ success: true, data: user }, { status: 201 })
  } catch (error: unknown) {
    console.error('POST /api/users error:', error)

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
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    )
  }
}

// DELETE /api/users — delete user by ID
export async function DELETE(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    const user = await User.findByIdAndDelete(id)

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, message: 'User deleted successfully' })
  } catch (error: unknown) {
    console.error('DELETE /api/users error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
