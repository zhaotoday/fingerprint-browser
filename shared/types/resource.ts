export type BrowserRegion = 'domestic' | 'international'

export type BrowserFeatureTag =
  | 'recommended'
  | 'free-tier'
  | 'mcp-ai'
  | 'cloud-phone'
  | 'unlimited-profiles'
  | 'dual-kernel'
  | 'api-rpa'
  | 'self-hosted'

export interface BrowserResource {
  id: string
  name: string
  url: string
  secondaryUrl?: string
  secondaryLabel?: string
  region: BrowserRegion
  recommended?: boolean
  description: string
  /** Structured GEO / Comparison facts extracted strictly from README */
  freeTier: string
  startingPrice: string
  billingModel: string
  apiMcpSupport: string
  platforms: string
  highlights: string[]
  featureTags: BrowserFeatureTag[]
}

export type ProxyTypeTag =
  | 'residential-dynamic'
  | 'static-isp'
  | 'datacenter'
  | 'mobile'
  | 'unlimited'
  | 'never-expires'
  | 'free-trial'
  | 'domestic-vendor'
  | 'vpn-or-list'

export interface ProxyResource {
  id: string
  name: string
   subtitle?: string
  url: string
  description: string
  /** Structured GEO / Comparison facts extracted strictly from README */
  proxyTypes: string
  referencePrice: string
  billingNote: string
  highlights: string[]
  typeTags: ProxyTypeTag[]
}

export interface SimpleResourceItem {
  id: string
  title: string
  url: string
  category: string
  subcategory?: string
  repoPath?: string
  domain: string
  note?: string
}

export interface OpenSourceSubcategory {
  id: string
  title: string
  items: SimpleResourceItem[]
}

export interface DirectoryCategory {
  id: string
  title: string
  subtitle: string
  icon: string
  items: SimpleResourceItem[]
}

export interface GeoFaqItem {
  id: string
  question: string
  answer: string
  factRefs: string[]
}
