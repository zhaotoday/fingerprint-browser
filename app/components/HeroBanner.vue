<script setup lang="ts">
import { useTemplateRef, shallowRef, onMounted, onUnmounted } from 'vue'

interface IncludedSummaryItem {
  title: string
  text: string
}

interface Props {
  title: string
  summaryParagraph1: string
  summaryParagraph2: string
  includedSummary: IncludedSummaryItem[]
  targetAudiences: string[]
  customDevNotice: string
  githubUrl: string
  pricingDisclaimer: string
  totalResourcesCount: number
  filteredResourcesCount: number
  browserCount: number
  proxyCount: number
  openSourceCount: number
}

interface Emits {
  resetFilters: []
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const searchModel = defineModel<string>('searchQuery', { required: true })
const searchInputRef = useTemplateRef<HTMLInputElement>('searchInput')
const copiedQq = shallowRef(false)

const quickKeywords = [
  { label: '⭐ 推荐', query: '推荐' },
  { label: 'MCP 接入', query: 'MCP' },
  { label: '免费额度', query: '免费' },
  { label: '云手机', query: '云手机' },
  { label: '无限环境', query: '无限环境' },
  { label: '流量不过期', query: '不过期' },
  { label: '静态 ISP', query: '静态' },
  { label: 'CloakBrowser', query: 'CloakBrowser' },
  { label: 'Camoufox', query: 'Camoufox' },
  { label: 'Patchright', query: 'Patchright' },
]

function onCardMouseMove(e: MouseEvent) {
  const target = e.currentTarget as HTMLElement | null
  if (!target) return
  const rect = target.getBoundingClientRect()
  target.style.setProperty('--mx', `${e.clientX - rect.left}px`)
  target.style.setProperty('--my', `${e.clientY - rect.top}px`)
}

async function copyQq() {
  if (import.meta.client && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText('6421664')
      copiedQq.value = true
      setTimeout(() => {
        copiedQq.value = false
      }, 2000)
    } catch {
      // Ignore fallback
    }
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === '/' && document.activeElement !== searchInputRef.value) {
    const tag = (document.activeElement as HTMLElement | null)?.tagName
    if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
      e.preventDefault()
      searchInputRef.value?.focus()
    }
  }
}

function clearSearch() {
  searchModel.value = ''
  emit('resetFilters')
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <section class="hero-section" aria-labelledby="hero-heading">
    <div class="hero-ambient" aria-hidden="true" />
    <div class="hero-grid-mask" aria-hidden="true" />

    <div class="container-shell hero-container">
      <!-- Top Split: Left (Editorial Copy + Search) | Right (fzlr-style Window Workspace Card) -->
      <div class="hero-top-grid">
        <div class="hero-main-col">
          <div class="hero-eyebrow-row">
            <span class="eyebrow">
              2026.10 实时维护 · 已收录 {{ totalResourcesCount }} 项资源
            </span>
          </div>

          <h1 id="hero-heading" class="hero-title">
            {{ title }}
          </h1>

          <p class="hero-p1">
            {{ summaryParagraph1 }}
          </p>

          <p class="hero-p2">
            {{ summaryParagraph2 }}
          </p>

          <!-- Clean Search Bar & Quick Filters -->
          <div class="hero-search-area">
            <div class="search-box">
              <span class="search-icon-tile" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" class="search-icon">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2" />
                  <path d="M20 20l-3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                </svg>
              </span>
              <input
                ref="searchInput"
                v-model="searchModel"
                type="search"
                class="search-input"
                placeholder="搜索指纹浏览器、代理 IP、MCP、云手机、Camoufox、Patchright、免费额度..."
                aria-label="全局搜索资源"
              />
              <button
                v-if="searchModel"
                type="button"
                class="clear-btn"
                @click="clearSearch"
              >
                重置 ({{ filteredResourcesCount }}/{{ totalResourcesCount }})
              </button>
              <div v-else class="search-shortcut" title="按 / 键快速聚焦搜索">
                <kbd class="search-kbd">/</kbd>
                <span class="shortcut-hint">快速检索</span>
              </div>
            </div>

            <div class="quick-tags-row">
              <span class="quick-tags-label">快捷筛选</span>
              <button
                v-for="kw in quickKeywords"
                :key="kw.query"
                type="button"
                class="quick-tag"
                :class="{ 'quick-tag-active': searchModel === kw.query }"
                @click="searchModel = searchModel === kw.query ? '' : kw.query"
              >
                {{ kw.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- Right fzlr.com-style Workspace Window Card -->
        <aside
          class="hero-workspace-card spotlight-surface"
          aria-label="适用人群与项目信息"
          @mousemove="onCardMouseMove"
        >
          <div class="workspace-chrome">
            <span class="chrome-dots" aria-hidden="true">
              <span class="dot dot-rose" />
              <span class="dot dot-amber" />
              <span class="dot dot-emerald" />
            </span>
            <span class="chrome-url">fingerprint-browser / overview</span>
            <span class="chrome-badge">
              <span class="badge-dot" aria-hidden="true" />
              <span>{{ browserCount }} 浏览器 · {{ proxyCount }} 代理</span>
            </span>
          </div>

          <div class="workspace-body">
            <div class="info-block">
              <div class="info-block-header">
                <span class="icon-tile" aria-hidden="true">
                  <svg viewBox="0 0 20 20" fill="none" class="svg-icon">
                    <circle cx="10" cy="6.5" r="3" stroke="currentColor" stroke-width="1.7" />
                    <path d="M4 16.5c0-2.8 2.7-4.5 6-4.5s6 1.7 6 4.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
                  </svg>
                </span>
                <h2 class="info-heading">适用人群</h2>
              </div>

              <ul class="audience-list">
                <li v-for="(aud, idx) in targetAudiences" :key="idx" class="audience-item">
                  <span class="audience-check" aria-hidden="true">
                    <svg viewBox="0 0 16 16" fill="none" class="check-svg">
                      <circle cx="8" cy="8" r="7" fill="currentColor" fill-opacity="0.14" />
                      <path d="M5 8.2L7 10.2L11.2 5.8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </span>
                  <span>{{ aud }}</span>
                </li>
              </ul>
            </div>

            <div class="info-divider" />

            <div class="info-block">
              <div class="info-inline-row">
                <span class="info-label">项目地址</span>
                <a
                  :href="githubUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="repo-inline-link"
                >
                  <span>{{ githubUrl }}</span>
                  <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>

            <div class="info-divider" />

            <div class="info-block">
              <div class="info-block-header">
                <span class="icon-tile" aria-hidden="true">
                  <svg viewBox="0 0 20 20" fill="none" class="svg-icon">
                    <path d="M6.5 7L3.5 10l3 3M13.5 7l3 3-3 3M11 5.5l-2 9" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </span>
                <h2 class="info-heading">专业接单</h2>
                <button
                  type="button"
                  class="copy-qq-chip"
                  @click="copyQq"
                >
                  {{ copiedQq ? '已复制 QQ' : '复制 QQ' }}
                </button>
              </div>
              <p class="dev-notice">{{ customDevNotice }}</p>
            </div>
          </div>
        </aside>
      </div>

      <!-- 3-Column Strip: 收录内容 -->
      <div class="included-grid">
        <article
          v-for="(item, index) in includedSummary"
          :key="index"
          class="included-card spotlight-surface"
          @mousemove="onCardMouseMove"
        >
          <div class="included-card-top">
            <span class="icon-tile tile-lg" aria-hidden="true">
              <svg v-if="index === 0" viewBox="0 0 20 20" fill="none" class="svg-icon-md">
                <path d="M5.5 10a4.5 4.5 0 0 1 9 0c0 2.1-.6 4-1.7 5.5M10 8.5v3.5c0 1.4-.5 2.7-1.4 3.8M3 10a7 7 0 0 1 14 0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
              </svg>
              <svg v-else-if="index === 1" viewBox="0 0 20 20" fill="none" class="svg-icon-md">
                <circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="1.6" />
                <path d="M3.2 10h13.6M10 3c1.9 2 2.8 4.4 2.8 7s-.9 5-2.8 7c-1.9-2-2.8-4.4-2.8-7s.9-5 2.8-7z" stroke="currentColor" stroke-width="1.6" />
              </svg>
              <svg v-else viewBox="0 0 20 20" fill="none" class="svg-icon-md">
                <path d="M6.5 6.5L3 10l3.5 3.5M13.5 6.5L17 10l-3.5 3.5M11.2 4.5l-2.4 11" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
            <h3 class="included-title">{{ item.title }}</h3>
            <span class="included-idx">0{{ index + 1 }}</span>
          </div>
          <p class="included-text">{{ item.text }}</p>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-section {
  position: relative;
  padding: 2.35rem 0 2.65rem;
  background-color: var(--bg-surface-elevated);
  border-bottom: 1px solid var(--border-subtle);
  overflow: hidden;
}

.hero-ambient {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    radial-gradient(64rem 34rem at 82% -8%, var(--aurora-1), transparent 65%),
    radial-gradient(52rem 28rem at 12% 105%, var(--aurora-2), transparent 60%);
  z-index: 0;
}

.hero-grid-mask {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(90deg, var(--grid-line) 1px, transparent 0),
    linear-gradient(var(--grid-line) 1px, transparent 0);
  background-size: 52px 52px;
  mask-image: radial-gradient(85% 75% at 50% 35%, #000 25%, transparent 76%);
  -webkit-mask-image: radial-gradient(85% 75% at 50% 35%, #000 25%, transparent 76%);
  z-index: 0;
}

.hero-container {
  position: relative;
  z-index: var(--z-base);
}

.hero-top-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1.5rem;
  align-items: stretch;
  margin-bottom: 1.5rem;
}

@media (min-width: 1040px) {
  .hero-top-grid {
    grid-template-columns: minmax(0, 1.32fr) minmax(0, 1fr);
    gap: 2rem;
  }
}

.hero-main-col {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}

.hero-eyebrow-row {
  margin-bottom: 0.75rem;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--c-brand-600);
}

.eyebrow::before {
  content: '';
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 2px;
  background-color: var(--c-brand-500);
  flex-shrink: 0;
}

.hero-title {
  margin: 0 0 0.75rem;
  font-size: clamp(1.85rem, 3.2vw, 2.55rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.12;
  color: var(--text-primary);
}

.hero-p1 {
  margin: 0 0 0.55rem;
  font-size: 0.96rem;
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1.7;
  max-width: 64ch;
}

.hero-p2 {
  margin: 0 0 1.15rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.7;
  max-width: 64ch;
}

/* Search Area */
.hero-search-area {
  margin-top: auto;
}

.search-box {
  display: flex;
  align-items: center;
  height: 48px;
  background: var(--bg-surface-solid);
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-md);
  padding: 0 0.75rem 0 0.5rem;
  box-shadow: var(--shadow-card);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.search-box:hover {
  border-color: var(--border-strong);
}

.search-box:focus-within {
  border-color: var(--c-brand-500);
  box-shadow: var(--shadow-focus);
}

.search-icon-tile {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  background: var(--accent-cyan-bg);
  color: var(--c-brand-600);
  box-shadow: inset 0 0 0 1px var(--accent-cyan-border);
  margin-right: 0.65rem;
  flex-shrink: 0;
}

.search-icon {
  width: 16px;
  height: 16px;
}

.search-input {
  width: 100%;
  min-width: 0;
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-size: 0.9rem;
  padding: 0.4rem 0;
  outline: none;
}

.search-input::placeholder {
  color: var(--text-faint);
}

.search-shortcut {
  display: none;
  align-items: center;
  gap: 0.35rem;
  flex-shrink: 0;
}

@media (min-width: 640px) {
  .search-shortcut {
    display: inline-flex;
  }
}

.search-kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  font-size: 0.72rem;
  font-weight: 600;
  font-family: var(--font-mono);
  color: var(--c-brand-600);
  background: var(--accent-cyan-bg);
  border: 1px solid var(--accent-cyan-border);
  border-radius: 5px;
}

.shortcut-hint {
  font-size: 0.74rem;
  color: var(--text-muted);
}

.clear-btn {
  flex-shrink: 0;
  height: 30px;
  padding: 0 0.7rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
  font-family: var(--font-mono);
  background: var(--c-brand-600);
  color: #ffffff;
  border: none;
  cursor: pointer;
}

.quick-tags-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.38rem;
  margin-top: 0.65rem;
}

.quick-tags-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  margin-right: 0.1rem;
}

.quick-tag {
  height: 27px;
  display: inline-flex;
  align-items: center;
  padding: 0 0.62rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  background: var(--bg-surface-solid);
  color: var(--text-secondary);
  border: 1px solid var(--border-medium);
  cursor: pointer;
  transition: all 0.18s ease;
}

.quick-tag:hover {
  border-color: var(--border-strong);
  color: var(--c-brand);
  background: var(--accent-cyan-bg);
}

.quick-tag-active {
  background: var(--c-brand-600);
  color: #ffffff;
  border-color: var(--c-brand-600);
}

.quick-tag-active:hover {
  background: var(--c-brand-700);
  color: #ffffff;
}

/* Right fzlr.com-style Workspace Card */
.hero-workspace-card {
  display: flex;
  flex-direction: column;
  background: var(--bg-surface-solid);
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  min-width: 0;
}

.workspace-chrome {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  border-bottom: 1px solid var(--border-subtle);
  background: linear-gradient(90deg, var(--bg-surface-elevated), var(--bg-surface-solid), var(--bg-surface-elevated));
}

.chrome-dots {
  display: flex;
  align-items: center;
  gap: 0.38rem;
}

.dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
}

.dot-rose {
  background: #fb7185;
}

.dot-amber {
  background: #fbbf24;
}

.dot-emerald {
  background: #34d399;
}

.chrome-url {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-faint);
}

.chrome-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.15rem 0.55rem;
  border-radius: 999px;
  background: var(--accent-cyan-bg);
  color: var(--c-brand-600);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--c-brand-500);
}

.workspace-body {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex: 1;
  padding: 1.15rem 1.25rem;
}

.info-block-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.55rem;
}

.icon-tile {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  background: var(--accent-cyan-bg);
  color: var(--c-brand-600);
  box-shadow: inset 0 0 0 1px var(--accent-cyan-border), inset 0 1px 0 rgba(255, 255, 255, 0.9);
  flex-shrink: 0;
}

.tile-lg {
  width: 34px;
  height: 34px;
  border-radius: 10px;
}

.svg-icon {
  width: 15px;
  height: 15px;
}

.svg-icon-md {
  width: 17px;
  height: 17px;
}

.info-heading {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-primary);
}

.audience-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.audience-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.82rem;
  color: var(--text-secondary);
  line-height: 1.55;
}

.audience-check {
  display: inline-flex;
  color: var(--c-brand-600);
  margin-top: 0.14rem;
  flex-shrink: 0;
}

.check-svg {
  width: 15px;
  height: 15px;
}

.info-divider {
  height: 1px;
  background: var(--border-subtle);
  margin: 0.75rem 0;
}

.info-inline-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.info-label {
  font-size: 0.84rem;
  font-weight: 700;
  color: var(--text-primary);
}

.repo-inline-link {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--c-brand-600);
  padding: 0.22rem 0.6rem;
  border-radius: 6px;
  background: var(--accent-cyan-bg);
  border: 1px solid var(--accent-cyan-border);
  white-space: nowrap;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all 0.18s ease;
}

.repo-inline-link:hover {
  background: var(--c-brand-600);
  color: #ffffff;
  border-color: var(--c-brand-600);
}

.copy-qq-chip {
  margin-left: auto;
  padding: 0.16rem 0.55rem;
  border-radius: 6px;
  font-size: 0.72rem;
  font-family: var(--font-mono);
  font-weight: 600;
  background: var(--accent-cyan-bg);
  color: var(--c-brand-600);
  border: 1px solid var(--accent-cyan-border);
  cursor: pointer;
  transition: all 0.18s ease;
}

.copy-qq-chip:hover {
  background: var(--c-brand-600);
  color: #ffffff;
}

.dev-notice {
  margin: 0;
  font-size: 0.82rem;
  color: var(--text-secondary);
  line-height: 1.55;
}

/* 3-Column Strip: 收录内容 (Equal height & balanced columns) */
.included-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1rem;
  align-items: stretch;
}

@media (min-width: 900px) {
  .included-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.included-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-surface-solid);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 1.15rem 1.25rem 1.25rem;
  box-shadow: var(--shadow-card);
  min-width: 0;
  transition:
    transform 0.22s var(--ease-out-quart),
    box-shadow 0.22s var(--ease-out-quart),
    border-color 0.22s var(--ease-out-quart);
}

.included-card:hover {
  transform: translateY(-2px);
  border-color: var(--border-strong);
  box-shadow: var(--shadow-card-hover);
}

.included-card-top {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.55rem;
}

.included-title {
  margin: 0;
  font-size: 0.96rem;
  font-weight: 700;
  color: var(--text-primary);
}

.included-idx {
  margin-left: auto;
  font-family: var(--font-mono);
  font-size: 0.74rem;
  font-weight: 600;
  color: var(--text-faint);
}

.included-text {
  margin: 0;
  font-size: 0.82rem;
  color: var(--text-secondary);
  line-height: 1.65;
}
</style>
