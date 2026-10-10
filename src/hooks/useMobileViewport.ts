'use client'

import { useEffect } from 'react'

export const MOBILE_MEDIA_QUERY = '(max-width: 767px), (max-width: 1023px) and (pointer: coarse)'

// Safari's keyboard changes the visual viewport without changing CSS dvh.
// Keep native scrolling; resize only the calculator and dialogs at scale 1.
export function useMobileViewport() {
  useEffect(() => {
    const viewport = window.visualViewport
    if (!viewport) return
    const root = document.documentElement
    let frame = 0
    const update = (event?: Event) => {
      const revealInput = event?.type !== 'scroll'
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        if (!window.matchMedia(MOBILE_MEDIA_QUERY).matches) {
          root.style.removeProperty('--mobile-viewport-height')
          root.style.removeProperty('--mobile-viewport-top')
          return
        }
        if (Math.abs(viewport.scale - 1) > .01) return
        root.style.setProperty('--mobile-viewport-height', `${Math.round(viewport.height)}px`)
        root.style.setProperty('--mobile-viewport-top', `${Math.round(viewport.offsetTop)}px`)
        const active = document.activeElement
        if (revealInput && viewport.height < window.innerHeight - 80 && active instanceof HTMLElement && active.matches('input, textarea, select')) {
          active.scrollIntoView({ block: 'nearest', inline: 'nearest' })
        }
      })
    }
    update()
    viewport.addEventListener('resize', update)
    viewport.addEventListener('scroll', update)
    window.addEventListener('resize', update)
    document.addEventListener('focusin', update)
    return () => {
      cancelAnimationFrame(frame)
      viewport.removeEventListener('resize', update)
      viewport.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      document.removeEventListener('focusin', update)
      root.style.removeProperty('--mobile-viewport-height')
      root.style.removeProperty('--mobile-viewport-top')
    }
  }, [])
}
