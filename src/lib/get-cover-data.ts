import pool from '@/lib/db'

export interface CoverImageData {
  url: string
  filename: string
}

/**
 * DB에서 직접 커버 이미지 데이터를 가져옵니다.
 * 네트워크 호출 없이 직접 DB 접근하여 안정성과 속도를 높입니다.
 */
export async function getCoverImageData(): Promise<CoverImageData | null> {
  try {
    const [rows] = await pool.query(`
      SELECT filename, updated_at, created_at
      FROM gallery 
      WHERE image_type = 'main' 
        AND deleted_at IS NULL 
        AND filename IS NOT NULL
        AND filename != ''
      ORDER BY created_at DESC 
      LIMIT 1
    `)

    const result = rows as Array<{
      filename: string
      updated_at: Date | string | null
      created_at: Date | string | null
    }>

    if (!result || !Array.isArray(result) || result.length === 0) {
      console.log('[DEBUG] getCoverImageData: No cover image found in database')
      return null
    }

    const item = result[0]
    
    if (!item.filename) {
      console.log('[DEBUG] getCoverImageData: Filename is empty')
      return null
    }

    // 타임스탬프 추출 로직
    let timestamp: number
    try {
      const date = item.updated_at || item.created_at || new Date()
      timestamp = date instanceof Date 
        ? date.getTime() 
        : new Date(date).getTime()
    } catch (error) {
      console.error('[DEBUG] getCoverImageData: Error parsing date, using current time:', error)
      timestamp = Date.now()
    }

    return {
      url: `/uploads/${item.filename}?v=${timestamp}`,
      filename: item.filename
    }
  } catch (error) {
    console.error('[DEBUG] getCoverImageData: Database error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return null
  }
}

