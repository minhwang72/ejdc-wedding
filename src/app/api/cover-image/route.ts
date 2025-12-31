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
    // updated_at이 없으면 created_at 사용, 둘 다 없으면 현재 시간 사용
    let timestamp: number
    if (result[0].updated_at) {
      timestamp = result[0].updated_at instanceof Date 
        ? result[0].updated_at.getTime() 
        : new Date(result[0].updated_at).getTime()
    } else if (result[0].created_at) {
      timestamp = result[0].created_at instanceof Date 
        ? result[0].created_at.getTime() 
        : new Date(result[0].created_at).getTime()
    } else {
      timestamp = Date.now()
    }
    
    // 이미지 파일의 실제 수정 시간도 확인 (더 정확한 버전 관리)
    try {
      const { stat } = await import('fs/promises')
      const { join } = await import('path')
      const uploadsDir = process.env.UPLOAD_DIR || '/app/public/uploads'
      const filePath = join(uploadsDir, result[0].filename)
      const fileStat = await stat(filePath)
      // 파일 수정 시간이 더 최신이면 그것을 사용
      if (fileStat.mtime.getTime() > timestamp) {
        timestamp = fileStat.mtime.getTime()
      }
    } catch (fileError) {
      // 파일이 없거나 접근할 수 없으면 DB 시간 사용
      console.log('Could not read file stat, using DB timestamp:', fileError)
    }
    
    const version = timestamp

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