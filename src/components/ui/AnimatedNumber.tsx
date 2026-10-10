'use client'

export default function AnimatedNumber({ value, digits }: { value: number | null; digits: number }) {
  if (value == null) return <>—</>

  const text = value.toFixed(digits)
  const chars = text.split('')
  return (
    <span
      key={text}
      className="t-digit-group is-animating"
      style={{
        '--digit-dur': '220ms',
        '--digit-stagger': '24ms',
        '--digit-distance': '4px',
        '--digit-blur': '1px',
      } as React.CSSProperties}
    >
      {chars.map((char, index) => (
        <span
          key={`${char}-${index}`}
          className="t-digit"
          data-stagger={index === chars.length - 2 ? '1' : index === chars.length - 1 ? '2' : undefined}
        >
          {char}
        </span>
      ))}
    </span>
  )
}

