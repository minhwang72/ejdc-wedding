import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import type { ApiResponse } from '@/types'

export async function GET() {
  try {
    // DB 연결 테스트 (타임아웃 설정)
    const queryPromise = (async () => {
      const connection = await pool.getConnection()
      try {
        await connection.ping()
        const [rows] = await connection.query('SELECT 1 as test, NOW() as current_time, DATABASE() as current_database')
        return rows
      } finally {
        connection.release()
      }
    })()
    
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Database connection timeout')), 10000)
    })
    
    const result = await Promise.race([queryPromise, timeoutPromise])
    
    // 연결 풀 상태 정보
    const poolInfo = {
      totalConnections: (pool as any)._allConnections?.length || 0,
      freeConnections: (pool as any)._freeConnections?.length || 0,
      queueLength: (pool as any)._connectionQueue?.length || 0,
    }
    
    return NextResponse.json<ApiResponse<{
      connected: true
      test: unknown
      poolInfo: typeof poolInfo
      timestamp: string
    }>>({
      success: true,
      data: {
        connected: true,
        test: result,
        poolInfo,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('DB connection test error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorCode = error instanceof Error && 'code' in error ? (error as any).code : undefined
    
    return NextResponse.json<ApiResponse<{
      connected: false
      error: string
      errorCode?: string
      timestamp: string
    }>>(
      {
        success: false,
        data: {
          connected: false,
          error: errorMessage,
          errorCode,
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    )
  }
}

