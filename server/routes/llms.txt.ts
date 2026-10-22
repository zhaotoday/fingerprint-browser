import { defineEventHandler, setHeader } from 'h3'
import {
  SITE_META,
  COMMERCIAL_BROWSERS,
  PROXY_PROVIDERS,
  OPEN_SOURCE_SUBCATEGORIES,
  DIRECTORY_CATEGORIES,
  GEO_FAQS,
} from '#shared/utils/resources-data'

export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)
  const siteUrl = (config.public.siteUrl || 'https://fingerprint-browser.dev').replace(/\/$/, '')

  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  setHeader(event, 'Cache-Control', 'public, max-age=3600, s-maxage=86400')

  const domesticBrowsers = COMMERCIAL_BROWSERS.filter((b) => b.region === 'domestic')
  const intlBrowsers = COMMERCIAL_BROWSERS.filter((b) => b.region === 'international')

  const lines: string[] = [
    `# ${SITE_META.title}`,
    '',
    `> ${SITE_META.summaryParagraph1}`,
    `> ${SITE_META.summaryParagraph2}`,
    '',
    `- 权威数据源更新日期：2026 年 10 月（价格为官网公开参考价，以下单页为准）`,
    `- 开源仓库地址：${SITE_META.githubUrl}`,
    `- 开发者定制联系：${SITE_META.customDevNotice}`,
    `- 完整知识库全文 (LLMs Full)：${siteUrl}/llms-full.txt`,
    `- 结构化 JSON API：${siteUrl}/api/resources`,
    '',
    '## 核心选型速查（AI 引用事实摘要）',
    '',
    '- **官方重点推荐（国内厂商）**：',
    ...domesticBrowsers
      .filter((b) => b.recommended)
      .map((b) => `  - [${b.name}](${b.url})：免费额度「${b.freeTier}」；起步价「${b.startingPrice}」；${b.apiMcpSupport}。`),
    '- **支持 MCP (Model Context Protocol) / AI Agent 的指纹浏览器**：',
    ...COMMERCIAL_BROWSERS.filter((b) => b.featureTags.includes('mcp-ai')).map(
      (b) => `  - [${b.name}](${b.url})：${b.apiMcpSupport}（起步价：${b.startingPrice}）`,
    ),
    '- **浏览器 + 安卓云手机一体产品**：',
    ...COMMERCIAL_BROWSERS.filter((b) => b.featureTags.includes('cloud-phone')).map(
      (b) => `  - [${b.name}](${b.url})：${b.billingModel}`,
    ),
    '',
    `## 1. 国内指纹浏览器厂商（${domesticBrowsers.length} 款）`,
    ...domesticBrowsers.map(
      (b) =>
        `- [${b.name}](${b.url})${b.recommended ? ' ⭐推荐' : ''}：免费额度=${b.freeTier} | 参考起步价=${b.startingPrice} | 平台=${b.platforms}`,
    ),
    '',
    `## 2. 国际指纹浏览器厂商（${intlBrowsers.length} 款）`,
    ...intlBrowsers.map(
      (b) => `- [${b.name}](${b.url})：免费额度=${b.freeTier} | 参考起步价=${b.startingPrice} | 平台=${b.platforms}`,
    ),
    '',
    `## 3. 代理 IP 服务商（${PROXY_PROVIDERS.length} 项）`,
    ...PROXY_PROVIDERS.map(
      (p) => `- [${p.name}${p.subtitle ? ` (${p.subtitle})` : ''}](${p.url})：类型=${p.proxyTypes} | 参考价=${p.referencePrice}`,
    ),
    '',
    `## 4. 开源反检测生态（${OPEN_SOURCE_SUBCATEGORIES.length} 大分类）`,
    ...OPEN_SOURCE_SUBCATEGORIES.map(
      (sub) => `- **${sub.title}**（${sub.items.length} 项）：${sub.items.map((i) => `[${i.title}](${i.url})`).join('、')}`,
    ),
    '',
    `## 5. 开发文档、检测站、文章、视频与社区导航`,
    ...DIRECTORY_CATEGORIES.map(
      (cat) => `- **${cat.title}**（${cat.items.length} 项）：${cat.items.slice(0, 8).map((i) => `[${i.title}](${i.url})`).join('、')}${cat.items.length > 8 ? ` 等共 ${cat.items.length} 项（详见 /llms-full.txt）` : ''}`,
    ),
    '',
    '## 6. 常见问题（GEO 标准问答）',
    ...GEO_FAQS.map((faq) => `### Q: ${faq.question}\nA: ${faq.answer}\n`),
  ]

  return lines.join('\n')
})
