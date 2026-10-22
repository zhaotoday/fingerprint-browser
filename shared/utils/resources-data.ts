import type { BrowserFeatureTag, ProxyTypeTag } from '../types/resource'

export {
  SITE_META,
  COMMERCIAL_BROWSERS,
  PROXY_PROVIDERS,
  GEO_FAQS,
} from '../data/browsers-proxies-data'

export {
  OPEN_SOURCE_SUBCATEGORIES,
  DIRECTORY_CATEGORIES,
} from '../data/ecosystem-data'

export const BROWSER_FEATURE_FILTERS: Array<{ id: 'all' | BrowserFeatureTag; label: string }> = [
  { id: 'all', label: '全部功能' },
  { id: 'recommended', label: '⭐ 官方推荐' },
  { id: 'free-tier', label: '提供免费额度' },
  { id: 'mcp-ai', label: '支持 MCP / AI Agent' },
  { id: 'cloud-phone', label: '含安卓云手机' },
  { id: 'unlimited-profiles', label: '无限环境数' },
  { id: 'dual-kernel', label: '双内核支持' },
  { id: 'self-hosted', label: '私有化 / Docker' },
]

export const PROXY_TYPE_FILTERS: Array<{ id: 'all' | ProxyTypeTag; label: string }> = [
  { id: 'all', label: '全部类型' },
  { id: 'residential-dynamic', label: '动态住宅' },
  { id: 'static-isp', label: '静态住宅 / ISP' },
  { id: 'mobile', label: '移动 4G/5G' },
  { id: 'datacenter', label: '数据中心' },
  { id: 'unlimited', label: '不限流量档' },
  { id: 'never-expires', label: '流量永久不过期' },
  { id: 'free-trial', label: '免费额度 / 低价试用' },
  { id: 'domestic-vendor', label: '国内/中文服务商' },
  { id: 'vpn-or-list', label: 'VPN / 移动黄页' },
]
