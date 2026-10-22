import { shallowRef, computed, readonly } from 'vue'
import type {
  BrowserRegion,
  BrowserFeatureTag,
  ProxyTypeTag,
  OpenSourceSubcategory,
  DirectoryCategory,
} from '#shared/types/resource'
import {
  SITE_META,
  COMMERCIAL_BROWSERS,
  PROXY_PROVIDERS,
  OPEN_SOURCE_SUBCATEGORIES,
  DIRECTORY_CATEGORIES,
  GEO_FAQS,
} from '#shared/utils/resources-data'

const POST_OPEN_SOURCE_IDS = new Set(['plugins', 'uncategorized'])

export function useResourceNavigation() {
  // Primitive reactive state using shallowRef per vue-best-practices
  const searchQuery = shallowRef('')
  const browserRegion = shallowRef<'all' | BrowserRegion>('all')
  const browserFeature = shallowRef<'all' | BrowserFeatureTag>('all')
  const browserViewMode = shallowRef<'cards' | 'table'>('cards')
  const proxyType = shallowRef<'all' | ProxyTypeTag>('all')
  const openSourceCategory = shallowRef<string>('all')
  const activeSectionId = shallowRef<string>('section-browsers')

  const normalizedQuery = computed(() => searchQuery.value.trim().toLowerCase())

  const filteredBrowsers = computed(() => {
    const q = normalizedQuery.value
    const region = browserRegion.value
    const feature = browserFeature.value

    return COMMERCIAL_BROWSERS.filter((item) => {
      if (region !== 'all' && item.region !== region) {
        return false
      }
      if (feature !== 'all' && !item.featureTags.includes(feature)) {
        return false
      }
      if (!q) {
        return true
      }
      return (
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.url.toLowerCase().includes(q) ||
        (item.secondaryUrl && item.secondaryUrl.toLowerCase().includes(q))
      )
    })
  })

  const filteredDomesticBrowsers = computed(() =>
    filteredBrowsers.value.filter((item) => item.region === 'domestic'),
  )

  const filteredInternationalBrowsers = computed(() =>
    filteredBrowsers.value.filter((item) => item.region === 'international'),
  )

  const filteredProxies = computed(() => {
    const q = normalizedQuery.value
    const pType = proxyType.value

    return PROXY_PROVIDERS.filter((item) => {
      if (pType !== 'all' && !item.typeTags.includes(pType)) {
        return false
      }
      if (!q) {
        return true
      }
      return (
        item.name.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
        item.description.toLowerCase().includes(q) ||
        item.url.toLowerCase().includes(q)
      )
    })
  })

  const filteredOpenSourceSubcategories = computed<OpenSourceSubcategory[]>(() => {
    const q = normalizedQuery.value
    const subId = openSourceCategory.value

    return OPEN_SOURCE_SUBCATEGORIES.filter((sub) => subId === 'all' || sub.id === subId)
      .map((sub) => {
        if (!q) {
          return sub
        }
        const matchedItems = sub.items.filter(
          (item) =>
            item.title.toLowerCase().includes(q) ||
            item.url.toLowerCase().includes(q) ||
            (item.repoPath && item.repoPath.toLowerCase().includes(q)) ||
            sub.title.toLowerCase().includes(q),
        )
        return {
          ...sub,
          items: matchedItems,
        }
      })
      .filter((sub) => sub.items.length > 0)
  })

  const filteredDirectoryCategories = computed<DirectoryCategory[]>(() => {
    const q = normalizedQuery.value
    if (!q) {
      return DIRECTORY_CATEGORIES
    }

    return DIRECTORY_CATEGORIES.map((cat) => {
      const matchedItems = cat.items.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.url.toLowerCase().includes(q) ||
          (item.repoPath && item.repoPath.toLowerCase().includes(q)) ||
          cat.title.toLowerCase().includes(q),
      )
      return {
        ...cat,
        items: matchedItems,
      }
    }).filter((cat) => cat.items.length > 0)
  })

  const preOpenSourceDirectoryCategories = computed<DirectoryCategory[]>(() =>
    filteredDirectoryCategories.value.filter((cat) => !POST_OPEN_SOURCE_IDS.has(cat.id)),
  )

  const postOpenSourceDirectoryCategories = computed<DirectoryCategory[]>(() =>
    filteredDirectoryCategories.value.filter((cat) => POST_OPEN_SOURCE_IDS.has(cat.id)),
  )

  const totalOpenSourceCount = computed(() =>
    OPEN_SOURCE_SUBCATEGORIES.reduce((sum, sub) => sum + sub.items.length, 0),
  )

  const filteredOpenSourceCount = computed(() =>
    filteredOpenSourceSubcategories.value.reduce((sum, sub) => sum + sub.items.length, 0),
  )

  const totalDirectoryCount = computed(() =>
    DIRECTORY_CATEGORIES.reduce((sum, cat) => sum + cat.items.length, 0),
  )

  const filteredDirectoryCount = computed(() =>
    filteredDirectoryCategories.value.reduce((sum, cat) => sum + cat.items.length, 0),
  )

  const totalAllResourcesCount = computed(
    () =>
      COMMERCIAL_BROWSERS.length +
      PROXY_PROVIDERS.length +
      totalOpenSourceCount.value +
      totalDirectoryCount.value,
  )

  const filteredAllResourcesCount = computed(
    () =>
      filteredBrowsers.value.length +
      filteredProxies.value.length +
      filteredOpenSourceCount.value +
      filteredDirectoryCount.value,
  )

  const sidebarSections = computed(() => {
    const preDir = DIRECTORY_CATEGORIES.filter((cat) => !POST_OPEN_SOURCE_IDS.has(cat.id)).map((cat) => {
      const filteredCat = filteredDirectoryCategories.value.find((c) => c.id === cat.id)
      return {
        id: `section-${cat.id}`,
        label: cat.title,
        count: filteredCat ? filteredCat.items.length : 0,
        total: cat.items.length,
      }
    })

    const postDir = DIRECTORY_CATEGORIES.filter((cat) => POST_OPEN_SOURCE_IDS.has(cat.id)).map((cat) => {
      const filteredCat = filteredDirectoryCategories.value.find((c) => c.id === cat.id)
      return {
        id: `section-${cat.id}`,
        label: cat.title,
        count: filteredCat ? filteredCat.items.length : 0,
        total: cat.items.length,
      }
    })

    return [
      {
        id: 'section-browsers',
        label: '指纹浏览器',
        count: filteredBrowsers.value.length,
        total: COMMERCIAL_BROWSERS.length,
      },
      {
        id: 'section-proxies',
        label: '代理',
        count: filteredProxies.value.length,
        total: PROXY_PROVIDERS.length,
      },
      ...preDir,
      {
        id: 'section-opensource',
        label: '开源',
        count: filteredOpenSourceCount.value,
        total: totalOpenSourceCount.value,
      },
      ...postDir,
      {
        id: 'section-geo-faq',
        label: '选型问答',
        count: GEO_FAQS.length,
        total: GEO_FAQS.length,
      },
    ]
  })

  function setSearchQuery(value: string) {
    searchQuery.value = value
  }

  function setBrowserRegion(region: 'all' | BrowserRegion) {
    browserRegion.value = region
  }

  function setBrowserFeature(feature: 'all' | BrowserFeatureTag) {
    browserFeature.value = feature
  }

  function setBrowserViewMode(mode: 'cards' | 'table') {
    browserViewMode.value = mode
  }

  function setProxyType(type: 'all' | ProxyTypeTag) {
    proxyType.value = type
  }

  function setOpenSourceCategory(subId: string) {
    openSourceCategory.value = subId
  }

  function setActiveSection(sectionId: string) {
    activeSectionId.value = sectionId
  }

  function resetAllFilters() {
    searchQuery.value = ''
    browserRegion.value = 'all'
    browserFeature.value = 'all'
    proxyType.value = 'all'
    openSourceCategory.value = 'all'
  }

  return {
    meta: SITE_META,
    faqs: GEO_FAQS,
    openSourceSubcategoriesAll: OPEN_SOURCE_SUBCATEGORIES,
    searchQuery: readonly(searchQuery),
    browserRegion: readonly(browserRegion),
    browserFeature: readonly(browserFeature),
    browserViewMode: readonly(browserViewMode),
    proxyType: readonly(proxyType),
    openSourceCategory: readonly(openSourceCategory),
    activeSectionId: readonly(activeSectionId),
    filteredBrowsers,
    filteredDomesticBrowsers,
    filteredInternationalBrowsers,
    filteredProxies,
    filteredOpenSourceSubcategories,
    filteredDirectoryCategories,
    preOpenSourceDirectoryCategories,
    postOpenSourceDirectoryCategories,
    totalOpenSourceCount,
    filteredOpenSourceCount,
    totalDirectoryCount,
    filteredDirectoryCount,
    totalAllResourcesCount,
    filteredAllResourcesCount,
    sidebarSections,
    setSearchQuery,
    setBrowserRegion,
    setBrowserFeature,
    setBrowserViewMode,
    setProxyType,
    setOpenSourceCategory,
    setActiveSection,
    resetAllFilters,
  }
}
