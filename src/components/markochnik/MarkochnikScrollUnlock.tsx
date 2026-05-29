'use client'

import { useEffect } from 'react'

export default function MarkochnikScrollUnlock() {
  useEffect(() => {
    const html = document.documentElement
    const body = document.body

    const prevHtml = {
      overflow: html.style.overflow,
      overflowY: html.style.overflowY,
      height: html.style.height,
      minHeight: html.style.minHeight,
      position: html.style.position,
      touchAction: html.style.touchAction,
    }

    const prevBody = {
      overflow: body.style.overflow,
      overflowY: body.style.overflowY,
      height: body.style.height,
      minHeight: body.style.minHeight,
      position: body.style.position,
      touchAction: body.style.touchAction,
      webkitOverflowScrolling: body.style.getPropertyValue('-webkit-overflow-scrolling'),
    }

    html.style.overflow = 'auto'
    html.style.overflowY = 'auto'
    html.style.height = 'auto'
    html.style.minHeight = '100%'
    html.style.position = 'static'
    html.style.touchAction = 'auto'

    body.style.overflow = 'auto'
    body.style.overflowY = 'auto'
    body.style.height = 'auto'
    body.style.minHeight = '100%'
    body.style.position = 'static'
    body.style.touchAction = 'auto'
    body.style.setProperty('-webkit-overflow-scrolling', 'touch')

    return () => {
      html.style.overflow = prevHtml.overflow
      html.style.overflowY = prevHtml.overflowY
      html.style.height = prevHtml.height
      html.style.minHeight = prevHtml.minHeight
      html.style.position = prevHtml.position
      html.style.touchAction = prevHtml.touchAction

      body.style.overflow = prevBody.overflow
      body.style.overflowY = prevBody.overflowY
      body.style.height = prevBody.height
      body.style.minHeight = prevBody.minHeight
      body.style.position = prevBody.position
      body.style.touchAction = prevBody.touchAction
      if (prevBody.webkitOverflowScrolling) {
        body.style.setProperty('-webkit-overflow-scrolling', prevBody.webkitOverflowScrolling)
      } else {
        body.style.removeProperty('-webkit-overflow-scrolling')
      }
    }
  }, [])

  return null
}
