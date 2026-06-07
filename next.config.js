/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["192.168.8.21"],
  experimental: {
    serverComponentsExternalPackages: [
      '@sparticuz/chromium',
      'puppeteer-core'
    ],
  },
};

module.exports = nextConfig;