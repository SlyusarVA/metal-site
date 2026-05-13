'use client'

import { Suspense } from 'react'
import CalculatorLayout from '@/components/calculator/CalculatorLayout'

export default function Home() {
  return (
    <Suspense fallback={<div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',color:'var(--on-surface-variant)'}}>Загрузка...</div>}>
      <CalculatorLayout />
    </Suspense>
  )
}
