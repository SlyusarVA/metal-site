import { findGostReference, getAllGostCodes } from '@/data/gost'
import GostPageClient from './GostPageClient'

export async function generateStaticParams() {
  const codes = getAllGostCodes()
  return codes.map((code) => ({ code: encodeURIComponent(code) }))
}

export default function GostPage({ params }: { params: { code: string } }) {
  const code = decodeURIComponent(params.code)
  const ref = findGostReference(code)
  return <GostPageClient code={code} ref={ref} />
}