'use client'

import { useState, useRef, useEffect } from 'react'
import type { Gallery } from '@/types'
import SectionHeading from '@/components/SectionHeading'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'

interface GallerySectionProps {
  gallery: Gallery[]
}

interface DisplayImage {
  id: number
  url: string
  isPlaceholder?: boolean
}

export default function GallerySection({ gallery }: GallerySectionProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set())
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const thumbnailScrollRef = useRef<HTMLDivElement>(null)
  const isInitialMount = useRef(true)

  // 스크롤 애니메이션 훅들
  const titleAnimation = useScrollAnimation({ threshold: 0.4, animationDelay: 200 })
  const mainImageAnimation = useScrollAnimation({ threshold: 0.3, animationDelay: 400 })
  const thumbnailAnimation = useScrollAnimation({ threshold: 0.2, animationDelay: 600 })

  // 실제 갤러리 이미지가 있으면 사용하고, 없으면 12개의 기본 placeholder 이미지 생성
  const placeholderImages: DisplayImage[] = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    url: `/images/gallery/placeholder-${i + 1}.jpg`,
    isPlaceholder: true,
  }))

  // 갤러리 이미지만 필터링하고 order_index로 정렬 (메인 이미지 제외)
  const galleryImages = gallery ? gallery
    .filter(item => item.image_type === 'gallery')
    .sort((a, b) => {
      // order_index가 null이면 맨 뒤로
      if (a.order_index === null && b.order_index === null) return 0
      if (a.order_index === null) return 1
      if (b.order_index === null) return -1
      
      // 숫자로 정렬
      return Number(a.order_index) - Number(b.order_index)
    }) : []

  const displayImages: DisplayImage[] = galleryImages && galleryImages.length > 0 
    ? galleryImages 
    : placeholderImages

  // 이미지 로드 실패 핸들러
  const handleImageError = (imageId: number) => {
    setFailedImages(prev => new Set(prev).add(imageId))
  }

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? displayImages.length - 1 : prev - 1
    )
  }

  const goToNext = () => {
    setCurrentImageIndex((prev) => 
      prev === displayImages.length - 1 ? 0 : prev + 1
    )
  }

  const goToImage = (index: number) => {
    setCurrentImageIndex(index)
  }

  // 터치 이벤트 핸들러
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null) // 이전 터치 종료점 초기화
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50 // 왼쪽으로 스와이프 (다음 이미지)
    const isRightSwipe = distance < -50 // 오른쪽으로 스와이프 (이전 이미지)

    if (isLeftSwipe && displayImages.length > 1) {
      goToNext()
    }
    if (isRightSwipe && displayImages.length > 1) {
      goToPrevious()
    }
  }

  // 현재 이미지 변경 시 썸네일 스크롤 조정 (초기 로드 시 제외)
  useEffect(() => {
    // 초기 마운트 시에는 스크롤 조정하지 않음
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    if (thumbnailScrollRef.current) {
      // 현재 선택된 이미지는 썸네일에서 제외되므로, 다음 썸네일을 찾아서 스크롤
      const thumbnails = Array.from(thumbnailScrollRef.current.children) as HTMLElement[]
      
      // 현재 인덱스보다 큰 썸네일 중 가장 가까운 것 찾기
      let targetThumbnail: HTMLElement | null = null
      
      for (let i = 0; i < thumbnails.length; i++) {
        const thumbnail = thumbnails[i]
        const dataIndex = parseInt(thumbnail.getAttribute('data-index') || '0')
        
        if (dataIndex > currentImageIndex) {
          targetThumbnail = thumbnail
          break
        }
      }
      
      // 다음 썸네일이 없으면 마지막 썸네일 사용
      if (!targetThumbnail && thumbnails.length > 0) {
        targetThumbnail = thumbnails[thumbnails.length - 1] as HTMLElement
      }
      
      if (targetThumbnail) {
        // scrollIntoView 대신 scrollLeft를 직접 조정하여 페이지 스크롤에 영향 없도록
        const container = thumbnailScrollRef.current
        const thumbnailRect = targetThumbnail.getBoundingClientRect()
        const containerRect = container.getBoundingClientRect()
        const scrollLeft = container.scrollLeft + (thumbnailRect.left - containerRect.left) - (containerRect.width / 2) + (thumbnailRect.width / 2)
        
        container.scrollTo({
          left: scrollLeft,
          behavior: 'smooth'
        })
      }
    }
  }, [currentImageIndex])

  return (
    <section className="w-full min-h-screen flex flex-col justify-center py-12 md:py-16 px-0 font-sans bg-white">
      <div className="max-w-4xl mx-auto text-center w-full px-4 md:px-6">
        <div 
          ref={titleAnimation.ref}
          className={`transition-all duration-800 mb-10 md:mb-14 ${titleAnimation.animationClass}`}
        >
          <SectionHeading
            kicker="Gallery"
            title="갤러리"
            size="sm"
          />
        </div>

        {/* 상단 가로선 */}
        <div className="w-full h-px bg-gray-200 mb-6 md:mb-8"></div>

        {/* 메인 이미지 영역 */}
        <div 
          ref={mainImageAnimation.ref}
          className={`mb-6 md:mb-8 px-8 md:px-12 transition-all duration-800 ${mainImageAnimation.animationClass}`}
        >
          <div 
            className="group relative w-full max-w-xs mx-auto aspect-[2/3] bg-transparent rounded-lg overflow-hidden"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {displayImages.length > 0 && (
              <>
                {('isPlaceholder' in displayImages[currentImageIndex] && displayImages[currentImageIndex].isPlaceholder) || failedImages.has(displayImages[currentImageIndex].id) ? (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <svg
                      className="w-16 md:w-24 h-16 md:h-24 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                ) : (
                  <img
                    src={displayImages[currentImageIndex].url}
                    alt={`Gallery ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover touch-none"
                    draggable={false}
                    onError={() => handleImageError(displayImages[currentImageIndex].id)}
                  />
                )}

                {/* 이전/다음 버튼 */}
                {displayImages.length > 1 && (
                  <>
                    <button
                      onClick={goToPrevious}
                      className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 bg-white/70 backdrop-blur-sm hover:bg-white/85 active:bg-white text-gray-700 p-1.5 md:p-2 rounded-full transition-all duration-300 touch-manipulation z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 shadow-sm hover:shadow-md active:scale-95"
                      aria-label="이전 이미지"
                    >
                      <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={goToNext}
                      className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 bg-white/70 backdrop-blur-sm hover:bg-white/85 active:bg-white text-gray-700 p-1.5 md:p-2 rounded-full transition-all duration-300 touch-manipulation z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 shadow-sm hover:shadow-md active:scale-95"
                      aria-label="다음 이미지"
                    >
                      <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* 썸네일 슬라이드 영역 */}
        {displayImages.length > 1 && (
          <div 
            ref={thumbnailAnimation.ref}
            className={`mb-6 md:mb-8 transition-all duration-800 ${thumbnailAnimation.animationClass}`}
          >
            <div 
              ref={thumbnailScrollRef}
              className="flex gap-2 md:gap-3 overflow-x-auto pb-2 scrollbar-hide"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {displayImages.map((item, index) => {
                // 현재 선택된 이미지는 썸네일에서 제외
                if (currentImageIndex === index) return null
                
                return (
                  <button
                    key={index}
                    data-index={index}
                    onClick={() => goToImage(index)}
                    className="flex-shrink-0 w-16 aspect-[2/3] md:w-20 md:aspect-[2/3] rounded-lg overflow-hidden transition-all opacity-60 hover:opacity-80"
                    aria-label={`이미지 ${index + 1} 선택`}
                  >
                    {('isPlaceholder' in item && item.isPlaceholder) || failedImages.has(item.id) ? (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <svg
                          className="w-6 h-6 md:w-8 md:h-8 text-gray-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    ) : (
                      <img
                        src={item.url}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={() => handleImageError(item.id)}
                      />
                    )}
                  </button>
                )
              })}
            </div>
            <style jsx>{`
              .scrollbar-hide::-webkit-scrollbar {
                display: none;
              }
            `}</style>
          </div>
        )}

        {/* 하단 가로선 */}
        <div className="w-full h-px bg-gray-200"></div>
      </div>
    </section>
  )
} 