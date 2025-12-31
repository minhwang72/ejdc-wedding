import { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  // 기본 이미지를 실제 존재하는 메인 이미지로 설정
  let imageUrl = 'https://ejdc.eungming.com/uploads/images/main_cover.jpg'
  
  try {
    // 서버 사이드에서는 내부 API 호출 사용 (SSL 인증서 문제 회피)
    const baseUrl = process.env.INTERNAL_API_URL || 
      (process.env.NODE_ENV === 'production' 
        ? 'http://127.0.0.1:1140'  // Docker 내부에서는 HTTP 사용 (IPv4)
        : 'http://127.0.0.1:3000')  // 개발 환경 (IPv4)
      
    console.log(`[DEBUG] Fetching cover image from: ${baseUrl}/api/cover-image`)
    
    // 타임아웃 설정 (10초)
    const fetchPromise = fetch(`${baseUrl}/api/cover-image`, {
      cache: 'no-store',
      next: { revalidate: 0 }, // ISR 캐시도 무효화
      headers: {
        'User-Agent': 'ejdcBot/1.0 (Wedding Invitation Metadata Generator)',
      }
    })
    
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Metadata fetch timeout')), 10000)
    })
    
    const response = await Promise.race([fetchPromise, timeoutPromise])
    
    console.log(`[DEBUG] Cover image API response status: ${response.status}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log(`[DEBUG] Cover image API response data:`, data)
      
      if (data.success && data.data?.url) {
        // URL이 상대 경로인 경우 절대 경로로 변환
        const rawUrl = data.data.url.startsWith('http') 
          ? data.data.url
          : `https://ejdc.eungming.com${data.data.url}`
        
        // URL 뒤에 현재 시간을 붙여 캐시 버스팅(Cache Busting)
        // API에서 이미 버전 파라미터가 있을 수 있으므로 추가로 타임스탬프 추가
        const separator = rawUrl.includes('?') ? '&' : '?'
        imageUrl = `${rawUrl}${separator}t=${new Date().getTime()}`
        console.log(`[DEBUG] Final image URL with Cache Bust:`, imageUrl)
      }
    } else {
      console.error(`[DEBUG] Cover image API failed with status: ${response.status}`)
    }
  } catch (error) {
    console.error('Error fetching cover image for metadata:', error)
    // 오류 발생 시 기본 메인 이미지 사용
    console.log(`[DEBUG] Using fallback image: ${imageUrl}`)
  }

  return {
    metadataBase: new URL('https://ejdc.eungming.com'),
    alternates: {
      canonical: 'https://ejdc.eungming.com',
    },
    title: "도찬 ♥ 은진\'s Wedding",
    description: "2026년 4월 11일 오후 12시, 정동제일교회에서 결혼식을 올립니다. 여러분의 축복으로 더 아름다운 날이 되길 바랍니다.",
    keywords: ["결혼식", "청첩장", "wedding", "invitation", "현도찬", "김은진", "정동제일교회"],
    openGraph: {
      title: "도찬 ♥ 은진\'s Wedding",
      description: "2026년 4월 11일 오후 12시\n정동제일교회에서 결혼식을 올립니다.\n여러분의 축복으로 더 아름다운 날이 되길 바랍니다.",
      url: "https://ejdc.eungming.com",
      siteName: "현도찬 ♥ 김은진 결혼식 청첩장",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: "현도찬 ♥ 김은진 결혼식 청첩장",
          secureUrl: imageUrl, // secure_url도 여기에 포함
        },
      ],
      locale: "ko_KR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "도찬 ♥ 은진\'s Wedding",
      description: "2026년 4월 11일 오후 12시, 정동제일교회에서 결혼식을 올립니다. 여러분의 축복으로 더 아름다운 날이 되길 바랍니다.",
      images: [imageUrl],
    },
    icons: {
      icon: '/favicon.svg',
      shortcut: '/favicon.svg',
      apple: '/favicon.svg',
    },
    other: {
      'og:image:width': '1200',
      'og:image:height': '630',
      'og:image:type': 'image/jpeg',
      'og:image:secure_url': imageUrl,
      'og:updated_time': new Date().toISOString(), // 메타데이터 갱신 시간
      // 카카오톡 전용 메타데이터
      'al:web:url': 'https://ejdc.eungming.com',
      'al:web:should_fallback': 'true',
    }
  }
} 