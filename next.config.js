/** @type {import('next').NextConfig} */
const isVercel = process.env.VERCEL === '1'
const isProductionBuild = process.env.NODE_ENV === 'production'
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sortament.pro'

const nextConfig = {
  output: 'export',
  basePath: '',
  assetPrefix: isProductionBuild && !isVercel ? siteUrl : undefined,
  trailingSlash: true,
  images: { unoptimized: true },
}

module.exports = nextConfig
