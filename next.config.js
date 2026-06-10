/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["192.168.8.21"],
  experimental: {
    serverComponentsExternalPackages: [
      '@sparticuz/chromium',
      'puppeteer-core'
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;