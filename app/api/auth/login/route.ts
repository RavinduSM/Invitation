import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/user'
import { signToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const body = await req.json()
    const email = String(body?.email ?? '').trim()
    const password = String(body?.password ?? '')

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const user = await User.findOne({ userEmail: email })

    if (!user || !(await user.comparePassword(password))) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    if (user.userRole !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Only admin users can sign in here' },
        { status: 403 }
      )
    }

    const token = signToken({
      userId: user._id.toString(),
      userName: user.userName,
      userEmail: user.userEmail,
      userRole: user.userRole,
    })

    const response = NextResponse.json(
      {
        success: true,
        data: {
          userName: user.userName,
          userEmail: user.userEmail,
          userRole: user.userRole,
        },
      },
      { status: 200 }
    )

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24,
    })

    return response
  } catch (error) {
    console.error('POST /api/auth/login error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to authenticate user' },
      { status: 500 }
    )
  }
}
