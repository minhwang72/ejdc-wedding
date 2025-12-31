import { Metadata } from 'next'
import HomePage from '@/components/HomePage'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// 동적 메타데이터 생성
export async function generateMetadata(): Promise<Metadata> {
  // DB에서 직접 커버 이미지 데이터 가져오기 (네트워크 호출 없이)
  const { getCoverImageData } = await import('@/lib/get-cover-data')
  const coverData = await getCoverImageData()
  
  const baseUrl = 'https://ejdc.eungming.com'
  const now = new Date().getTime() // 매번 바뀌는 번호 생성
  
  let imageUrl: string
  if (coverData) {
    // DB에서 가져온 경우 - 이미 v= 파라미터가 있을 수 있으므로 &로 추가
    imageUrl = `${baseUrl}${coverData.url}&t=${now}`
    console.log(`[DEBUG] generateMetadata: Using cover image from DB:`, imageUrl)
  } else {
    // [중요] DB에 데이터가 없어서 기본 이미지를 쓸 때도 숫자를 강제로 붙입니다!
    imageUrl = `${baseUrl}/uploads/images/main_cover.jpg?t=${now}`
    console.log(`[DEBUG] generateMetadata: Using fallback image with timestamp:`, imageUrl)
  }
  
  console.log("최종 이미지 경로:", imageUrl)

  return {
    metadataBase: new URL('https://ejdc.eungming.com'),
    alternates: {
      canonical: 'https://ejdc.eungming.com',
    },
    title: "현도찬 ♥ 김은진 결혼합니다",
    description: "2026년 4월 11일 오후 12시, 정동제일교회에서 결혼식을 올립니다. We invite you to our wedding. 여러분의 축복으로 더 아름다운 날이 되길 바랍니다.",
    keywords: ["결혼식", "청첩장", "wedding", "invitation", "현도찬", "김은진", "정동제일교회"],
    openGraph: {
      title: "현도찬 ♥ 김은진 결혼합니다",
      description: "2026년 4월 11일 오후 12시\n정동제일교회에서 결혼식을 올립니다.\nWe invite you to our wedding.\n여러분의 축복으로 더 아름다운 날이 되길 바랍니다.",
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
      title: "현도찬 ♥ 김은진 결혼합니다",
      description: "2026년 4월 11일 오후 12시, 정동제일교회에서 결혼식을 올립니다. We invite you to our wedding.",
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

export default function InvitationPage() {
  return (
    <div className="min-h-screen theme-bg-main md:theme-bg-secondary">
      <HomePage />
    </div>
  )
} 