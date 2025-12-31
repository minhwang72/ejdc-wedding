import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { verifyPassword } from '@/lib/encryption'

// Next.js 라우트 핸들러 설정
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// CORS preflight 요청 처리
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Credentials': 'true',
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    // 요청 본문 파싱
    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { success: false, message: '요청 데이터를 파싱할 수 없습니다.' },
        { status: 400 }
      )
    }
    
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: '사용자명과 비밀번호를 입력해주세요.' },
        { status: 400 }
      )
    }

    // 사용자명으로 admin 조회 (타임아웃 설정)
    const queryPromise = pool.query(
      'SELECT id, username, password FROM admin WHERE username = ?',
      [username]
    )
    
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Database query timeout')), 10000)
    })
    
    const [rows] = await Promise.race([queryPromise, timeoutPromise]) as [unknown[], unknown]
    
    const adminRows = rows as { id: number; username: string; password: string }[]
    
    if (adminRows.length === 0) {
      return NextResponse.json(
        { success: false, message: '잘못된 사용자명 또는 비밀번호입니다.' },
        { status: 401 }
      )
    }

    const admin = adminRows[0]
    
    // 저장된 해시된 비밀번호를 검증
    try {
      if (!verifyPassword(password, admin.password)) {
        return NextResponse.json(
          { success: false, message: '잘못된 사용자명 또는 비밀번호입니다.' },
          { status: 401 }
        )
      }
    } catch (verifyError) {
      console.error('Password verification error:', verifyError)
      return NextResponse.json(
        { success: false, message: '비밀번호 검증 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    // 세션 생성 (24시간)
    const sessionId = `admin_${admin.id}_${Date.now()}`
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24시간

    const response = NextResponse.json({
      success: true,
      message: '로그인에 성공했습니다.',
      admin: {
        id: admin.id,
        username: admin.username
      }
    })

    // CORS 헤더 추가
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.set('Access-Control-Allow-Credentials', 'true')

    // httpOnly 쿠키 설정
    // secure는 HTTPS 사용 시에만 true로 설정 (환경변수로 제어 가능)
    const isSecure = process.env.COOKIE_SECURE === 'true' || 
                     (process.env.NODE_ENV === 'production' && process.env.USE_HTTPS === 'true')
    
    response.cookies.set('admin_session', sessionId, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      expires: expiresAt,
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Login error:', error)
    // 에러 상세 정보 로깅 (항상 로깅)
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      code: error instanceof Error && 'code' in error ? (error as any).code : undefined,
      errno: error instanceof Error && 'errno' in error ? (error as any).errno : undefined,
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    }
    console.error('Error details:', errorDetails)
    
    const errorResponse = NextResponse.json(
      { 
        success: false, 
        message: '로그인 처리 중 오류가 발생했습니다.',
        error: errorDetails.message,
        ...(errorDetails.code ? { errorCode: errorDetails.code } : {})
      },
      { status: 500 }
    )
    // 에러 응답에도 CORS 헤더 추가
    errorResponse.headers.set('Access-Control-Allow-Origin', '*')
    errorResponse.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
    errorResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type')
    errorResponse.headers.set('Access-Control-Allow-Credentials', 'true')
    return errorResponse
  }
} 