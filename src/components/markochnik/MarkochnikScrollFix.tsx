'use client'

import { useEffect } from 'react'

const css = `
@media (max-width: 767px) {
  html.markochnik-scroll-html,
  body.markochnik-scroll-page {
    block-size: auto !important;
    min-block-size: 100% !important;
    position: static !important;
    overflow: auto !important;
    overflow-y: auto !important;
    overscroll-behavior-y: auto !important;
    touch-action: pan-y !important;
    -webkit-overflow-scrolling: touch;
  }

  body.markochnik-scroll-page > div {
    block-size: auto !important;
    max-block-size: none !important;
    min-block-size: 100svh !important;
    overflow: visible !important;
  }

  body.markochnik-scroll-page > div > div,
  body.markochnik-scroll-page > div > div > * {
    block-size: auto !important;
    max-block-size: none !important;
    min-block-size: 0 !important;
    overflow: visible !important;
  }

  body.markochnik-scroll-page main {
    min-block-size: auto !important;
    overflow: visible !important;
  }
}
`

export default function MarkochnikScrollFix() {
  useEffect(() => {
    const html = document.documentElement
    const body = document.body
    const style = document.createElement('style')

    style.setAttribute('data-markochnik-scroll-fix', 'true')
    style.textContent = css
    document.head.appendChild(style)

    html.classList.add('markochnik-scroll-html')
    body.classList.add('markochnik-scroll-page')

    return () => {
      html.classList.remove('markochnik-scroll-html')
      body.classList.remove('markochnik-scroll-page')
      style.remove()
    }
  }, [])

  return null
}
