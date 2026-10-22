import { defineEventHandler, setHeader } from 'h3'

export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)
  const siteUrl = (config.public.siteUrl || 'https://fingerprint-browser.dev').replace(/\/$/, '')
  const lastMod = '2026-10-22'

  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  setHeader(event, 'Cache-Control', 'public, max-age=3600, s-maxage=86400')

  const urls = [
    { loc: `${siteUrl}/`, priority: '1.0', changefreq: 'weekly' },
    { loc: `${siteUrl}/llms.txt`, priority: '0.9', changefreq: 'weekly' },
    { loc: `${siteUrl}/llms-full.txt`, priority: '0.9', changefreq: 'weekly' },
    { loc: `${siteUrl}/api/resources`, priority: '0.8', changefreq: 'weekly' },
  ]

  const xmlItems = urls
    .map(
      (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlItems}
</urlset>`
})
