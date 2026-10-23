import { defineEventHandler } from 'h3'
import {
  SITE_META,
  COMMERCIAL_BROWSERS,
  PROXY_PROVIDERS,
  OPEN_SOURCE_SUBCATEGORIES,
  DIRECTORY_CATEGORIES,
  GEO_FAQS,
} from '#shared/utils/resources-data'

export default defineEventHandler(() => {
  const openSourceCount = OPEN_SOURCE_SUBCATEGORIES.reduce((acc, sub) => acc + sub.items.length, 0)
  const directoryCount = DIRECTORY_CATEGORIES.reduce((acc, cat) => acc + cat.items.length, 0)

  return {
    updatedAt: '2026-10',
    meta: SITE_META,
    stats: {
      commercialBrowsers: COMMERCIAL_BROWSERS.length,
      domesticBrowsers: COMMERCIAL_BROWSERS.filter((b) => b.region === 'domestic').length,
      internationalBrowsers: COMMERCIAL_BROWSERS.filter((b) => b.region === 'international').length,
      proxyProviders: PROXY_PROVIDERS.length,
      openSourceProjects: openSourceCount,
      directoryResources: directoryCount,
      totalResources: COMMERCIAL_BROWSERS.length + PROXY_PROVIDERS.length + openSourceCount + directoryCount,
    },
    commercialBrowsers: COMMERCIAL_BROWSERS,
    proxyProviders: PROXY_PROVIDERS,
    openSourceSubcategories: OPEN_SOURCE_SUBCATEGORIES,
    directoryCategories: DIRECTORY_CATEGORIES,
    faqs: GEO_FAQS,
  }
})
