export default function ProfileIcon({ icon, size = 28 }: { icon: string; size?: number }) {
  const mask = `url("/icons/${icon}.svg") center / contain no-repeat`
  return <span aria-hidden="true" style={{
    display: 'inline-block', width: size, height: size, flexShrink: 0,
    backgroundColor: 'currentColor', WebkitMask: mask, mask, maskMode: 'alpha',
  }} />
}
