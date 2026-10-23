<script setup lang="ts">
import { computed, shallowRef, onMounted, onUnmounted } from 'vue'

const config = useRuntimeConfig()
const siteUrl = (config.public.siteUrl || 'https://fingerprint-browser.dev').replace(/\/$/, '')

const {
  meta,
  faqs,
  openSourceSubcategoriesAll,
  searchQuery,
  browserRegion,
  browserFeature,
  browserViewMode,
  proxyType,
  openSourceCategory,
  activeSectionId,
  filteredBrowsers,
  filteredDomesticBrowsers,
  filteredInternationalBrowsers,
  filteredProxies,
  filteredOpenSourceSubcategories,
  preOpenSourceDirectoryCategories,
  postOpenSourceDirectoryCategories,
  totalOpenSourceCount,
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
} = useResourceNavigation()

const searchModel = computed({
  get: () => searchQuery.value,
  set: (val: string) => setSearchQuery(val),
})

const showBackToTop = shallowRef(false)

function updateActiveOnScroll() {
  if (!import.meta.client) return
  showBackToTop.value = window.scrollY > 420

  const sections = sidebarSections.value
  let currentId = sections[0]?.id || 'section-browsers'

  for (const sec of sections) {
    const el = document.getElementById(sec.id)
    if (!el) continue
    const rect = el.getBoundingClientRect()
    if (rect.top <= 140) {
      currentId = sec.id
    }
  }

  if (currentId !== activeSectionId.value) {
    setActiveSection(currentId)
  }
}

function scrollToTop() {
  if (import.meta.client) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

onMounted(() => {
  if (!import.meta.client) return
  window.addEventListener('scroll', updateActiveOnScroll, { passive: true })
  updateActiveOnScroll()
})

onUnmounted(() => {
  if (!import.meta.client) return
  window.removeEventListener('scroll', updateActiveOnScroll)
})

const structuredDataJson = computed(() => {
  const graph = [
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      name: meta.title,
      alternateName: 'Antidetect & Fingerprint Browser Directory',
      url: `${siteUrl}/`,
      description: `${meta.summaryParagraph1} ${meta.summaryParagraph2}`,
      inLanguage: 'zh-CN',
    },
    {
      '@type': 'CollectionPage',
      '@id': `${siteUrl}/#collectionpage`,
      url: `${siteUrl}/`,
      name: meta.title,
      isPartOf: { '@id': `${siteUrl}/#website` },
      dateModified: '2026-10-22',
      description: meta.summaryParagraph1,
    },
    {
      '@type': 'ItemList',
      '@id': `${siteUrl}/#browsers-list`,
      name: '指纹浏览器',
      numberOfItems: filteredBrowsers.value.length,
      itemListElement: filteredBrowsers.value.map((b, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        item: {
          '@type': 'SoftwareApplication',
          name: b.name,
          url: b.url,
          applicationCategory: 'BrowserApplication',
          operatingSystem: b.platforms,
          description: b.description,
        },
      })),
    },
    {
      '@type': 'ItemList',
      '@id': `${siteUrl}/#proxies-list`,
      name: '代理',
      numberOfItems: filteredProxies.value.length,
      itemListElement: filteredProxies.value.map((p, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        item: {
          '@type': 'Service',
          name: p.subtitle ? `${p.name}（${p.subtitle}）` : p.name,
          url: p.url,
          serviceType: p.proxyTypes,
          description: p.description,
        },
      })),
    },
    {
      '@type': 'FAQPage',
      '@id': `${siteUrl}/#faqpage`,
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    },
  ]

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': graph,
  })
})

useHead({
  link: [{ rel: 'canonical', href: `${siteUrl}/` }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: structuredDataJson,
    },
  ],
})
</script>

<template>
  <div class="page-wrapper">
    <HeroBanner
      v-model:search-query="searchModel"
      :title="meta.title"
      :summary-paragraph1="meta.summaryParagraph1"
      :summary-paragraph2="meta.summaryParagraph2"
      :included-summary="meta.includedSummary"
      :target-audiences="meta.targetAudiences"
      :custom-dev-notice="meta.customDevNotice"
      :github-url="meta.githubUrl"
      :pricing-disclaimer="meta.pricingDisclaimer"
      :total-resources-count="totalAllResourcesCount"
      :filtered-resources-count="filteredAllResourcesCount"
      :browser-count="filteredBrowsers.length"
      :proxy-count="filteredProxies.length"
      :open-source-count="totalOpenSourceCount"
      @reset-filters="resetAllFilters"
    />

    <div class="container-shell directory-layout">
      <CategorySidebar
        :sections="sidebarSections"
        :active-section-id="activeSectionId"
        @select-section="setActiveSection"
      />

      <div class="content-column">
        <!-- 1. 指纹浏览器 -->
        <BrowserSection
          :all-filtered-browsers="filteredBrowsers"
          :domestic-browsers="filteredDomesticBrowsers"
          :international-browsers="filteredInternationalBrowsers"
          :selected-region="browserRegion"
          :selected-feature="browserFeature"
          :view-mode="browserViewMode"
          :pricing-disclaimer="meta.pricingDisclaimer"
          @update-region="setBrowserRegion"
          @update-feature="setBrowserFeature"
          @update-view-mode="setBrowserViewMode"
        />

        <!-- 2. 代理 -->
        <ProxySection
          :proxies="filteredProxies"
          :selected-type="proxyType"
          :pricing-disclaimer="meta.pricingDisclaimer"
          @update-type="setProxyType"
        />

        <!-- 3. 云手机 / 浏览器 / 网址 / 资源导航 / 检测网站 / 文章 / B 站 / 知乎 / 视频 / 资源集合 -->
        <DirectorySection
          v-for="cat in preOpenSourceDirectoryCategories"
          :key="cat.id"
          :category="cat"
        />

        <!-- 4. 开源（16 个子分类） -->
        <OpenSourceSection
          :all-subcategories="openSourceSubcategoriesAll"
          :filtered-subcategories="filteredOpenSourceSubcategories"
          :selected-subcategory-id="openSourceCategory"
          :total-count="totalOpenSourceCount"
          @update-subcategory="setOpenSourceCategory"
        />

        <!-- 5. 插件 / 其他未整理 -->
        <DirectorySection
          v-for="cat in postOpenSourceDirectoryCategories"
          :key="cat.id"
          :category="cat"
        />

        <!-- 6. 选型事实库与常见问答 (GEO Fact Card & FAQ) -->
        <GeoFaqSection
          :faqs="faqs"
          :custom-dev-notice="meta.customDevNotice"
          :custom-dev-qq="meta.customDevQq"
          :github-url="meta.githubUrl"
        />
      </div>
    </div>

    <!-- Floating Back-to-Top Button -->
    <button
      v-show="showBackToTop"
      type="button"
      class="back-to-top-fab"
      aria-label="回到顶部"
      title="回到顶部"
      @click="scrollToTop"
    >
      <svg viewBox="0 0 20 20" fill="none" class="fab-icon" aria-hidden="true">
        <path
          d="M10 15V5M5.5 9.5L10 5l4.5 4.5"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.directory-layout {
  display: flex;
  flex-direction: column;
  gap: 2.25rem;
  padding-top: 2.25rem;
}

@media (min-width: 1024px) {
  .directory-layout {
    flex-direction: row;
    align-items: flex-start;
  }
}

.content-column {
  flex: 1;
  min-width: 0;
}

.back-to-top-fab {
  position: fixed;
  right: 1.5rem;
  bottom: 1.75rem;
  z-index: var(--z-header);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background: var(--c-brand-600);
  color: #ffffff;
  border: 1px solid var(--c-brand-500);
  box-shadow: var(--shadow-float);
  cursor: pointer;
  transition: transform 0.2s var(--ease-out-quart), background-color 0.2s var(--ease-out-quart);
}

.back-to-top-fab:hover {
  background: var(--c-brand-700);
  color: #ffffff;
  transform: translateY(-2px);
}

.fab-icon {
  width: 18px;
  height: 18px;
}
</style>
