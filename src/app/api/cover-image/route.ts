import { NextResponse } from 'next/server'
import type { ApiResponse } from '@/types'
import { getCoverImageData } from '@/lib/get-cover-data'

// Node.js 런타임 명시 (fs 모듈 사용 가능하도록)
export const runtime = 'nodejs'

export async function GET() {
  try {
    const coverData = await getCoverImageData()
    
    if (!coverData) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'No cover image found',
      }, { status: 404 })
    }

    // 추가 타임스탬프를 붙여 더 강력한 캐시 버스팅
    const separator = coverData.url.includes('?') ? '&' : '?'
    const urlWithTimestamp = `${coverData.url}${separator}t=${Date.now()}`

    return NextResponse.json<ApiResponse<{ url: string }>>({
      success: true,
      data: { url: urlWithTimestamp },
    })
  } catch (error) {
    console.error('[DEBUG] cover-image API: Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error: error
    })
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch cover image',
      },
      { status: 500 }
    )
  }
} 