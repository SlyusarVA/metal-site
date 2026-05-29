'use client'

import { useEffect } from 'react'

export default function MarkochnikScrollFix() {
  useEffect(() => {
    document.body.classList.add('markochnik-scroll-page')
    return () => document.body.classList.remove('markochnik-scroll-page')
  }, [])

  return null
}
