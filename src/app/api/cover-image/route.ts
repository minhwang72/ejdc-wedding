import { NextResponse } from 'next/server'
import type { ApiResponse } from '@/types'
import { getCoverImageData } from '@/lib/get-cover-data'

// Node.js 런타임 명시 (fs 모듈 사용 가능하도록)
export const runtime = 'nodejs'

export async function GET() {
  try {
    const coverData = await getCoverImageData()
    
    // DB에 이미지가 없어도 fallback 이미지를 반환 (404 방지)
    let imageUrl: string
    if (coverData) {
      // 추가 타임스탬프를 붙여 더 강력한 캐시 버스팅
      const separator = coverData.url.includes('?') ? '&' : '?'
      imageUrl = `${coverData.url}${separator}t=${Date.now()}`
    } else {
      // Fallback 이미지 사용
      imageUrl = `/uploads/images/main_cover.jpg?t=${Date.now()}`
      console.log('[DEBUG] cover-image API: No cover image in DB, using fallback')
    }

    return NextResponse.json<ApiResponse<{ url: string }>>({
      success: true,
      data: { url: imageUrl },
    })
  } catch (error) {
    console.error('[DEBUG] cover-image API: Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error: error
    })
    // 에러 발생 시에도 fallback 이미지 반환 (404 방지)
    return NextResponse.json<ApiResponse<{ url: string }>>({
      success: true,
      data: { url: `/uploads/images/main_cover.jpg?t=${Date.now()}` },
    })
  }
} 