export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin.amr.a9el',
          '/dashboard.a9el.amr',
          '/verify',
          '/login',
          '/register',
          '/profile',
        ],
      },
    ],
    sitemap: 'https://molim.team/sitemap.xml',
  }
}
