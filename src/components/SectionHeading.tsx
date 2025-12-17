import { ReactNode } from 'react'

type SectionHeadingProps = {
  kicker?: string
  title?: ReactNode
  description?: ReactNode
  align?: 'left' | 'center'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  descriptionWidth?: 'narrow' | 'default'
}

const sizeClass: Record<NonNullable<SectionHeadingProps['size']>, string> = {
  sm: 'text-[1.6rem] md:text-[2.1rem]',
  md: 'text-[2rem] md:text-[2.6rem]',
  lg: 'text-[2.3rem] md:text-[3rem]'
}

export default function SectionHeading({
  kicker,
  title,
  description,
  align = 'center',
  size = 'md',
  className,
  descriptionWidth = 'default'
}: SectionHeadingProps) {
  const alignment = align === 'center' ? 'text-center' : 'text-left'
  const kickerAlignment = align === 'center' ? 'justify-center' : ''
  const descriptionAlignment = align === 'center' ? 'mx-auto' : ''
  const wrapperClass = ['space-y-4', alignment, 'py-4', className].filter(Boolean).join(' ').trim()
  const descriptionWidthClass = descriptionWidth === 'narrow' ? 'max-w-xl' : 'max-w-2xl'

  const hasTitle = Boolean(title)

  return (
    <div className={wrapperClass}>
      {kicker && (
        <p className={['section-kicker', 'py-1.5', kickerAlignment].filter(Boolean).join(' ').trim()}>
          <span>{kicker}</span>
        </p>
      )}
      {hasTitle && (
        <h2 className={['section-title leading-[1.25]', 'py-1.5', 'font-bold', sizeClass[size]].join(' ')} style={{ color: '#5b5b5b' }}>
          {title}
        </h2>
      )}
      {description && (
        <div
          className={[
            'section-description',
            descriptionAlignment,
            descriptionWidthClass,
            hasTitle ? 'py-1.5' : 'py-2'
          ]
            .filter(Boolean)
            .join(' ')
            .trim()}
        >
          {description}
        </div>
      )}
    </div>
  )
}

