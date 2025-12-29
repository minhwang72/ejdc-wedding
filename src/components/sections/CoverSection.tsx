'use client'

import { useState, useEffect } from 'react'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'

export default function CoverSection() {
  const [imageUrl, setImageUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const photoAnimation = useScrollAnimation({ threshold: 0.2, animationDelay: 400 })
  const heartAnimation = useScrollAnimation({ threshold: 0.1, animationDelay: 2000 })

  useEffect(() => {
    const fetchCoverImage = async () => {
      try {
        // 타임아웃 설정 (10초)
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000)
        
        const response = await fetch('/api/cover-image', {
          signal: controller.signal
        })
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        
        const data = await response.json()
        if (data.success && data.data?.url) {
          setImageUrl(data.data.url)
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.error('Error fetching cover image: Request timeout')
        } else {
          console.error('Error fetching cover image:', error)
        }
        // 에러 발생 시 기본 이미지 사용 (무한 로딩 방지)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCoverImage()
  }, [])

  const hasImage = Boolean(imageUrl)
  const overlayTextShadow = { textShadow: '0 12px 28px rgba(0,0,0,0.45)' }

  return (
    <section className="w-full min-h-screen">
      <div className="relative w-full min-h-screen flex flex-col">
        <div className="absolute inset-0">
          {isLoading ? (
            <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          ) : hasImage ? (
            <img src={imageUrl} alt="Wedding Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center gap-4 border border-dashed border-gray-200 text-center px-6">
              <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-sm text-gray-500">커버 사진을 준비 중입니다.</p>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/65" />
        </div>

        <div
          ref={photoAnimation.ref}
          className={`relative z-10 flex flex-col flex-1 px-6 md:px-12 py-10 text-white transition-opacity duration-700 ${photoAnimation.animationClass}`}
        >
          <div className="text-left space-y-3 text-white/90 mb-auto" style={overlayTextShadow}>
            <p className="text-[0.8rem] md:text-sm font-heading tracking-[0.4em] uppercase">April 11, 2026 · 12:00 PM</p>
            <p className="text-base md:text-lg font-heading">정동제일교회 본당</p>
            <p className="text-xs md:text-sm tracking-[0.3em] uppercase">CHUNGDONG First Methodist Church</p>
          </div>

          <div
            className={`flex justify-between items-center text-[0.65rem] md:text-xs tracking-[0.35em] uppercase text-white/75 font-heading ${heartAnimation.animationClass}`}
            style={overlayTextShadow}
          >
            <span>도찬</span>
            <span className="theme-text-accent text-base md:text-lg">✺</span>
            <span>은진</span>
          </div>

          <div className="text-center mt-auto pb-8" style={overlayTextShadow}>
            <p className="text-lg md:text-2xl text-white font-heading tracking-[0.25em]">
              도찬 & 은진
            </p>
            <p className="text-xs md:text-sm text-white/75 font-heading tracking-[0.3em] uppercase mt-1">
              Dochan &amp; Eunjin
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}