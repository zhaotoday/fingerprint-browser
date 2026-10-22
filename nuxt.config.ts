// https://nuxt.com/docs/4.x/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-06-01',
  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      siteUrl: 'https://fingerprint-browser.dev',
      siteName: '指纹浏览器与代理 IP 资源导航 | Antidetect Browser Directory',
      githubRepo: 'https://github.com/zhaotoday/fingerprint-browser',
      authorQq: '6421664',
      lastUpdated: '2026-10',
    },
  },

  app: {
    head: {
      htmlAttrs: {
        lang: 'zh-CN',
        'data-theme': 'light',
      },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      title: '指纹浏览器（防关联浏览器）与代理 IP 资源导航 - 2026 选型对比与开源生态全集',
      meta: [
        {
          name: 'description',
          content:
            '收录整理 32 款主流商用指纹浏览器（Roxy、紫鸟、AdsPower、比特、Multilogin、GoLogin、CloakBrowser 等）、34 项代理 IP 服务商（Rola IP、Bright Data、Oxylabs、Decodo、快代理、青果网络、922、Luna 等）最新套餐价格、免费额度、API/MCP 支持对比，以及 110+ 开源反检测浏览器、Chromium 内核指纹定制、Patchright/Camoufox 自动化框架与教程资料。',
        },
        {
          name: 'keywords',
          content:
            '指纹浏览器,防关联浏览器,反检测浏览器,Antidetect Browser,Fingerprint Browser,代理IP,住宅代理,静态ISP,Roxy浏览器,紫鸟浏览器,AdsPower,比特浏览器,Multilogin,GoLogin,CloakBrowser,Camoufox,Patchright,跨境电商多账号,浏览器自动化,MCP浏览器',
        },
        { name: 'author', content: 'zhaotoday (QQ: 6421664)' },
        { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' },
        { property: 'og:type', content: 'website' },
        {
          property: 'og:title',
          content: '指纹浏览器（防关联浏览器）与代理 IP 资源导航 - 2026 选型对比与开源生态全集',
        },
        {
          property: 'og:description',
          content:
            '涵盖 32 款国内外指纹浏览器价格与免费额度对比、34 家代理 IP 服务商参考单价、110+ 开源反检测浏览器与 Chromium 指纹定制项目，支持跨境电商、社媒矩阵、Web3 与 AI Agent 自动化选型。',
        },
        { property: 'og:locale', content: 'zh_CN' },
        { name: 'twitter:card', content: 'summary_large_image' },
        {
          name: 'twitter:title',
          content: '指纹浏览器（防关联浏览器）与代理 IP 资源导航 (2026.10 更新)',
        },
        {
          name: 'twitter:description',
          content:
            '主流指纹浏览器套餐价格对比、住宅/ISP 代理 IP 选型指南、开源反检测浏览器与 Chromium 内核定制开发全集。',
        },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Outfit:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap',
        },
        { rel: 'alternate', type: 'text/plain', title: 'LLMs.txt (GEO AI Index)', href: '/llms.txt' },
        { rel: 'alternate', type: 'text/plain', title: 'LLMs-Full.txt (Full Knowledge Base)', href: '/llms-full.txt' },
      ],
    },
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/', '/llms.txt', '/llms-full.txt', '/sitemap.xml', '/robots.txt', '/api/resources'],
    },
  },
})
