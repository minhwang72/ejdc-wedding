import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { hashPassword } from '@/lib/encryption'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: '사용자명과 비밀번호를 입력해주세요.' },
        { status: 400 }
      )
    }

    // 기존 사용자 확인
    const [existingRows] = await pool.query(
      'SELECT id FROM admin WHERE username = ?',
      [username]
    )
    
    const existingAdmins = existingRows as { id: number }[]
    
    if (existingAdmins.length > 0) {
      return NextResponse.json(
        { success: false, message: '이미 존재하는 사용자명입니다.' },
        { status: 400 }
      )
    }

    // 비밀번호 해시화
    const hashedPassword = hashPassword(password)

    // 관리자 계정 생성
    const [result] = await pool.query(
      'INSERT INTO admin (username, password) VALUES (?, ?)',
      [username, hashedPassword]
    )

    const insertResult = result as { insertId: number }

    return NextResponse.json({
      success: true,
      message: '관리자 계정이 생성되었습니다.',
      data: {
        id: insertResult.insertId,
        username: username
      }
    })

  } catch (error) {
    console.error('Create admin error:', error)
    return NextResponse.json(
      { success: false, message: '관리자 계정 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

