import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import type { ApiResponse } from '@/types'

export async function GET() {
  try {
    // 메인 이미지 조회 (삭제되지 않은 것 중 가장 최근 것)
    const [rows] = await pool.query(`
      SELECT filename, updated_at, created_at
      FROM gallery 
      WHERE image_type = 'main' 
        AND deleted_at IS NULL 
        AND filename IS NOT NULL
      ORDER BY created_at DESC 
      LIMIT 1
    `)
    
    const result = rows as { filename: string; updated_at: Date | string; created_at: Date | string }[]
    
    if (result.length === 0) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'No cover image found',
      }, { status: 404 })
    }

    // 이미지 업데이트 시간을 기반으로 버전 생성 (카카오톡 캐시 무효화)
    const updatedAt = result[0].updated_at || result[0].created_at
    const version = updatedAt instanceof Date 
      ? updatedAt.getTime() 
      : new Date(updatedAt).getTime()

    return NextResponse.json<ApiResponse<{ url: string }>>({
      success: true,
      data: { url: `/uploads/${result[0].filename}?v=${version}` },
    })
  } catch (error) {
    console.error('Error fetching cover image:', error)
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Failed to fetch cover image',
      },
      { status: 500 }
    )
  }
} 