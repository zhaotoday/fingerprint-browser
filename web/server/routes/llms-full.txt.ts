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
  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  setHeader(event, 'Cache-Control', 'public, max-age=3600, s-maxage=86400')

  const domesticBrowsers = COMMERCIAL_BROWSERS.filter((b) => b.region === 'domestic')
  const intlBrowsers = COMMERCIAL_BROWSERS.filter((b) => b.region === 'international')

  const lines: string[] = [
    `# ${SITE_META.title} (Full Knowledge Base / llms-full.txt)`,
    '',
    SITE_META.summaryParagraph1,
    '',
    SITE_META.summaryParagraph2,
    '',
    '## 收录内容概览',
    ...SITE_META.includedSummary.map((s) => `- **${s.title}**：${s.text}`),
    '',
    '## 适用人群',
    ...SITE_META.targetAudiences.map((a) => `- ${a}`),
    '',
    `- 项目地址：${SITE_META.githubUrl}`,
    `- 专业接单：${SITE_META.customDevNotice}`,
    `- ${SITE_META.pricingDisclaimer}`,
    '',
    '---',
    '',
    '## 一、商用指纹浏览器完整资料（国内厂商 13 款 + 国际厂商 19 款）',
    '',
    '### 1.1 国内厂商（中文界面、客服与文档友好）',
    '',
    ...domesticBrowsers.flatMap((b) => [
      `#### ${b.name}${b.recommended ? ' ⭐ 推荐' : ''}`,
      `- 官网链接：${b.url}${b.secondaryUrl ? ` （备用/官网：${b.secondaryUrl}）` : ''}`,
      `- 免费额度：${b.freeTier}`,
      `- 参考起步价：${b.startingPrice}`,
      `- 计费模式：${b.billingModel}`,
      `- API / MCP 支持：${b.apiMcpSupport}`,
      `- 支持系统：${b.platforms}`,
      `- 详细说明：${b.description}`,
      '',
    ]),
    '### 1.2 国际厂商（英文界面为主，海外团队常用）',
    '',
    ...intlBrowsers.flatMap((b) => [
      `#### ${b.name}`,
      `- 官网链接：${b.url}`,
      `- 免费额度：${b.freeTier}`,
      `- 参考起步价：${b.startingPrice}`,
      `- 计费模式：${b.billingModel}`,
      `- API / MCP 支持：${b.apiMcpSupport}`,
      `- 支持系统：${b.platforms}`,
      `- 详细说明：${b.description}`,
      '',
    ]),
    '---',
    '',
    '## 二、代理 IP 服务商完整资料（34 项）',
    '',
    ...PROXY_PROVIDERS.flatMap((p) => [
      `### ${p.name}${p.subtitle ? `（${p.subtitle}）` : ''}`,
      `- 官网链接：${p.url}`,
      `- 代理类型：${p.proxyTypes}`,
      `- 参考单价：${p.referencePrice}`,
      `- 计费与使用说明：${p.billingNote}`,
      `- 详细说明：${p.description}`,
      '',
    ]),
    '---',
    '',
    '## 三、开源项目与技术生态（16 个子分类）',
    '',
    ...OPEN_SOURCE_SUBCATEGORIES.flatMap((sub) => [
      `### ${sub.title}`,
      ...sub.items.map((item) => `- [${item.title}](${item.url})${item.note ? ` — ${item.note}` : ''}`),
      '',
    ]),
    '---',
    '',
    '## 四、云手机、AI 浏览器、检测站、开发文档、文章、视频与插件',
    '',
    ...DIRECTORY_CATEGORIES.flatMap((cat) => [
      `### ${cat.title}（${cat.subtitle}）`,
      ...cat.items.map((item) => `- [${item.title}](${item.url})${item.note ? ` — ${item.note}` : ''}`),
      '',
    ]),
    '---',
    '',
    '## 五、GEO 事实问答库（FAQ）',
    '',
    ...GEO_FAQS.flatMap((faq) => [`### Q: ${faq.question}`, `${faq.answer}`, '']),
  ]

  return lines.join('\n')
})
