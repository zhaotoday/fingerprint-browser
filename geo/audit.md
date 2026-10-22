# GEO 体检报告（Audit）

- **体检日期**：2026-10-22
- **架构状态**：Nuxt 4 SSR / Nitro 预渲染（所有 282 项资源、价格明细与对比表直接输出于初始 HTML，无需客户端执行 JS 即可被所有传统与 AI 爬虫完整读取）。

## 爬虫与机器可读性检查项

| 检查项 | 状态 | 证据与实现路径 |
| --- | --- | --- |
| `robots.txt` AI 爬虫放行 | ✅ 已通过 | `/robots.txt` 显式放行 `Googlebot`, `Bingbot`, `Baiduspider`, `Bytespider`, `OAI-SearchBot`, `GPTBot`, `Claude-SearchBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended` |
| 原始 HTML 包含全部正文 | ✅ 已通过 | Nuxt 4 SSR 渲染，所有折叠详情默认在 DOM 中输出完整文本，无 JS 门控隐藏 |
| `llms.txt` 与 `llms-full.txt` | ✅ 已通过 | 提供 `/llms.txt` 摘要索引与 `/llms-full.txt` 全量 Markdown 事实库 |
| 结构化数据 `JSON-LD` | ✅ 已通过 | 首页内嵌 `WebSite`, `CollectionPage`, `ItemList`, `FAQPage` 结构化 Schema |
| `sitemap.xml` | ✅ 已通过 | `/sitemap.xml` 自动生成站点地图并在 `robots.txt` 中声明 |
| 事实一致性与负面边界说明 | ✅ 已通过 | 页面内置速查对比表与 GEO 标准问答，明确标注适用人群、价格算式与不适用场景 |
