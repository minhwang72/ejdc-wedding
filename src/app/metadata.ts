import { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  // DB에서 직접 커버 이미지 데이터 가져오기 (네트워크 호출 없이)
  const { getCoverImageData } = await import('@/lib/get-cover-data')
  const coverData = await getCoverImageData()
  
  // 데이터가 없으면 기본 이미지 사용
  let imageUrl: string
  if (coverData) {
    const baseUrl = 'https://ejdc.eungming.com'
    const rawUrl = `${baseUrl}${coverData.url}`
    // 추가 타임스탬프를 붙여 더 강력한 캐시 버스팅
    const separator = rawUrl.includes('?') ? '&' : '?'
    imageUrl = `${rawUrl}${separator}t=${new Date().getTime()}`
    console.log(`[DEBUG] generateMetadata: Using cover image from DB:`, imageUrl)
  } else {
    imageUrl = 'https://ejdc.eungming.com/uploads/images/main_cover.jpg'
    console.log(`[DEBUG] generateMetadata: Using fallback image:`, imageUrl)
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