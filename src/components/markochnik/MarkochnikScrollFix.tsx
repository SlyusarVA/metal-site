'use client'

import { useEffect } from 'react'

export default function MarkochnikScrollFix() {
  useEffect(() => {
    const html = document.documentElement
    const body = document.body

    const prevHtmlOverflow = html.style.overflow
    const prevHtmlOverflowY = html.style.overflowY
    const prevHtmlHeight = html.style.height
    const prevBodyOverflow = body.style.overflow
    const prevBodyOverflowY = body.style.overflowY
    const prevBodyHeight = body.style.height

    html.style.overflow = 'auto'
    html.style.overflowY = 'auto'
    html.style.height = 'auto'
    body.style.overflow = 'auto'
    body.style.overflowY = 'auto'
    body.style.height = 'auto'
    body.style.setProperty('-webkit-overflow-scrolling', 'touch')

    return () => {
      html.style.overflow = prevHtmlOverflow
      html.style.overflowY = prevHtmlOverflowY
      html.style.height = prevHtmlHeight
      body.style.overflow = prevBodyOverflow
      body.style.overflowY = prevBodyOverflowY
      body.style.height = prevBodyHeight
    }
  }, [])

  return null
}
