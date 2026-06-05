/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["192.168.8.21"],
  serverExternalPackages: ['@sparticuz/chromium', 'puppeteer-core'],
};

module.exports = nextConfig;