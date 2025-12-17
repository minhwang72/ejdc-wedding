'use client'

import SectionHeading from '@/components/SectionHeading'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'

export default function WeddingDateSection() {
  // 스크롤 애니메이션 훅들
  const titleAnimation = useScrollAnimation({ threshold: 0.4, animationDelay: 200 })
  const calendarAnimation = useScrollAnimation({ threshold: 0.3, animationDelay: 400 })
  const dateInfoAnimation = useScrollAnimation({ threshold: 0.2, animationDelay: 600 })

  // 2026년 4월 달력 생성
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month - 1, 1).getDay()
  }

  const year = 2026
  const month = 4
  const daysInMonth = getDaysInMonth(year, month)
  const firstDayOfMonth = getFirstDayOfMonth(year, month)
  const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

  // 달력 배열 생성
  const calendarDays: Array<{ day: number; isWeddingDay: boolean } | null> = []
  
  // 첫 번째 주의 빈 공간 채우기
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null)
  }
  
  // 날짜 채우기
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({
      day,
      isWeddingDay: day === 11 // 04월 11일이 결혼식 날
    })
  }

  const getDayClass = (dayInfo: { day: number; isWeddingDay: boolean } | null) => {
    if (!dayInfo) return 'h-10 md:h-12 w-full text-center flex items-center justify-center text-sm md:text-base text-gray-300'
    
    // 실제 날짜를 기반으로 요일 계산
    const actualDate = new Date(year, month - 1, dayInfo.day)
    const dayOfWeek = actualDate.getDay()
    const weekendClass = dayOfWeek === 0 || dayOfWeek === 6 ? 'text-gray-600' : 'text-gray-700'
    
    if (dayInfo.isWeddingDay) {
      return `h-10 md:h-12 w-full text-center flex items-center justify-center text-sm md:text-base relative ${weekendClass}`
    }
    
    return `h-10 md:h-12 w-full text-center flex items-center justify-center text-sm md:text-base transition-colors rounded ${weekendClass}`
  }

  return (
    <section className="w-full min-h-screen flex flex-col justify-center py-12 md:py-16 px-0 font-sans bg-white">
      <div className="max-w-xl mx-auto text-center w-full px-6 md:px-8">
        <div ref={titleAnimation.ref} className={`transition-all duration-800 ${titleAnimation.animationClass}`}>
          <SectionHeading
            kicker="Schedule"
            title="4월"
            description=" "
            size="sm"
          />
        </div>

        {/* 상단 가로선 */}
        <div className="w-full h-px bg-gray-200 mb-6 md:mb-8"></div>

        {/* 달력 전체 */}
        <div 
          ref={calendarAnimation.ref}
          className={`transition-all duration-800 ${calendarAnimation.animationClass}`}
        >
          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 gap-2 md:gap-3 mb-4 md:mb-6">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-[11px] md:text-xs font-heading text-gray-500 tracking-[0.35em] py-2 md:py-3"
              >
                {day}
              </div>
            ))}
          </div>

          {/* 달력 */}
          <div className="grid grid-cols-7 gap-2 md:gap-3">
            {calendarDays.map((dayInfo, dayIndex) => (
              <div key={dayIndex} className={getDayClass(dayInfo)}>
                {dayInfo?.isWeddingDay ? (
                  <>
                    {/* 강조 원 배경 */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className="w-8 md:w-10 h-8 md:h-10 rounded-full shadow-sm"
                        style={{ backgroundColor: 'var(--theme-accent-secondary)' }}
                      ></div>
                    </div>
                    {/* 흰색 숫자 */}
                    <span className="relative z-10 text-white font-medium">
                      {dayInfo.day}
                    </span>
                  </>
                ) : (
                  dayInfo?.day || ''
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 하단 가로선 */}
        <div className="w-full h-px bg-gray-200 mt-6 md:mt-8 mb-8 md:mb-10"></div>

        {/* 날짜 및 시간 정보 */}
        <div 
          ref={dateInfoAnimation.ref}
          className={`space-y-3 md:space-y-4 transition-all duration-800 ${dateInfoAnimation.animationClass}`}
        >
          <div className="text-base md:text-lg font-heading text-gray-700 tracking-[0.4em] uppercase">
            2026년 4월 11일 토요일&nbsp;&nbsp;|&nbsp;&nbsp;오후 12시
          </div>
          
          <div className="text-base md:text-lg font-heading text-gray-700 tracking-[0.4em] uppercase">
            Saturday, April 11, 2026&nbsp;&nbsp;|&nbsp;&nbsp;PM 12:00
          </div>
        </div>
      </div>
    </section>
  )
} 