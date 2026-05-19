/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '',
  assetPrefix: 'https://sortament.pro',
  trailingSlash: true,
  images: { unoptimized: true },
}
module.exports = nextConfig
