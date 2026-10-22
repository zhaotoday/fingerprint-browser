<script setup lang="ts">
import { shallowRef, onMounted } from 'vue'

interface Props {
  totalCount: number
  githubUrl: string
  customDevQq: string
  activeSectionId?: string
}

interface Emits {
  selectSection: [sectionId: string]
}

withDefaults(defineProps<Props>(), {
  activeSectionId: 'section-browsers',
})

const emit = defineEmits<Emits>()

const themeMode = shallowRef<'system' | 'light' | 'dark'>('light')
const copiedQq = shallowRef(false)

const navLinks = [
  { id: 'section-browsers', label: '指纹浏览器' },
  { id: 'section-proxies', label: '代理 IP' },
  { id: 'section-web-docs', label: '网址' },
  { id: 'section-articles', label: '文章' },
  { id: 'section-videos', label: '视频' },
  { id: 'section-opensource', label: '开源' },
  { id: 'section-plugins', label: '插件' },
]

function scrollToTop() {
  if (import.meta.client) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

function applyTheme(mode: 'system' | 'light' | 'dark') {
  themeMode.value = mode
  if (!import.meta.client) return
  try {
    localStorage.setItem('fp-theme-mode', mode)
  } catch {
    // ignore storage restriction
  }
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const resolved = mode === 'system' ? (prefersDark ? 'dark' : 'light') : mode
  document.documentElement.setAttribute('data-theme', resolved)
}

async function copyQqNumber(qq: string) {
  if (import.meta.client && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(qq)
      copiedQq.value = true
      setTimeout(() => {
        copiedQq.value = false
      }, 2000)
    } catch {
      // Ignore clipboard fallback
    }
  }
}

onMounted(() => {
  try {
    const saved = localStorage.getItem('fp-theme-mode') as 'system' | 'light' | 'dark' | null
    if (saved === 'system' || saved === 'light' || saved === 'dark') {
      applyTheme(saved)
      return
    }
  } catch {
    // ignore
  }
  const current = document.documentElement.getAttribute('data-theme')
  themeMode.value = current === 'dark' ? 'dark' : 'light'
})
</script>

<template>
  <header class="site-header">
    <nav class="container-shell header-inner" aria-label="主导航">
      <a
        href="#main-content"
        class="brand-link"
        aria-label="指纹浏览器（防关联浏览器）资源整理"
        @click.prevent="scrollToTop"
      >
        <svg width="36" height="36" viewBox="0 0 64 64" fill="none" aria-hidden="true" class="brand-svg">
          <rect width="64" height="64" rx="14" fill="#3b82f6" />
          <path d="M18 35C18 26.7157 24.268 20 32 20C39.732 20 46 26.7157 46 35C46 38.8 44.8 42.3 42.7 45" stroke="#ffffff" stroke-width="3.8" stroke-linecap="round" />
          <path d="M23 48.5C20.8 45.2 19.6 41.2 19.6 36.8" stroke="#bfdbfe" stroke-width="3.8" stroke-linecap="round" />
          <path d="M24 35.5C24 30.8056 27.5817 27 32 27C36.4183 27 40 30.8056 40 35.5C40 41.2 37.8 46.2 34.2 49.5" stroke="#ffffff" stroke-width="3.8" stroke-linecap="round" />
          <path d="M32 33.5C32 38.5 30.6 43.2 28.2 47" stroke="#ffffff" stroke-width="4" stroke-linecap="round" />
          <circle cx="32" cy="33.5" r="2.6" fill="#34d399" />
          <circle cx="15" cy="13" r="2" fill="#93c5fd" />
          <circle cx="22" cy="13" r="2" fill="#bfdbfe" />
          <circle cx="29" cy="13" r="2" fill="#ffffff" />
        </svg>
        <span class="brand-text-group">
          <span class="brand-title">指纹浏览器资源整理</span>
          <span class="brand-sub">antidetect &amp; proxy directory</span>
        </span>
      </a>

      <ul class="header-nav" role="list">
        <li v-for="link in navLinks" :key="link.id">
          <a
            :href="`#${link.id}`"
            class="nav-link"
            :class="{ 'nav-link-active': activeSectionId === link.id }"
            @click="emit('selectSection', link.id)"
          >
            {{ link.label }}
          </a>
        </li>
      </ul>

      <div class="header-actions">
        <button
          type="button"
          class="qq-contact-btn"
          :title="`点击复制专业接单 QQ：${customDevQq}`"
          @click="copyQqNumber(customDevQq)"
        >
          <span class="qq-dot" aria-hidden="true" />
          <span>{{ copiedQq ? `已复制：${customDevQq}` : `接单 QQ：${customDevQq}` }}</span>
        </button>

        <a
          :href="githubUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="btn-primary-hdr"
          aria-label="GitHub 项目地址"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" class="icon-sm" aria-hidden="true">
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            />
          </svg>
          <span>GitHub</span>
        </a>

        <div class="theme-segment" role="group" aria-label="外观主题">
          <button
            type="button"
            class="theme-opt"
            :class="{ 'theme-opt-active': themeMode === 'light' }"
            title="浅色模式"
            @click="applyTheme('light')"
          >
            浅色
          </button>
          <button
            type="button"
            class="theme-opt"
            :class="{ 'theme-opt-active': themeMode === 'dark' }"
            title="深色模式"
            @click="applyTheme('dark')"
          >
            深色
          </button>
          <button
            type="button"
            class="theme-opt"
            :class="{ 'theme-opt-active': themeMode === 'system' }"
            title="跟随系统偏好"
            @click="applyTheme('system')"
          >
            自动
          </button>
        </div>
      </div>
    </nav>
  </header>
</template>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: var(--z-header);
  height: 68px;
  background: var(--bg-glass);
  backdrop-filter: saturate(150%) blur(12px);
  -webkit-backdrop-filter: saturate(150%) blur(12px);
  border-bottom: 1px solid var(--border-subtle);
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  gap: 1.25rem;
}

.brand-link {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  flex-shrink: 0;
  border-radius: 0.5rem;
  transition: transform 0.2s ease;
}

.brand-link:active {
  transform: scale(0.98);
}

.brand-svg {
  flex-shrink: 0;
  display: block;
}

.brand-text-group {
  display: flex;
  flex-direction: column;
  line-height: 1;
}

.brand-title {
  font-size: 1.0625rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  color: var(--text-primary);
}

.brand-sub {
  margin-top: 0.32rem;
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  color: var(--text-muted);
}

/* fzlr.com underline-style navigation */
.header-nav {
  display: none;
  align-items: center;
  gap: 0.25rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

@media (min-width: 1024px) {
  .header-nav {
    display: flex;
  }
}

.nav-link {
  position: relative;
  display: inline-flex;
  align-items: center;
  height: 2.375rem;
  padding: 0 0.875rem;
  border-radius: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--text-secondary);
  transition: color 0.2s, background-color 0.2s;
}

.nav-link:hover {
  color: var(--c-brand);
  background: rgba(59, 130, 246, 0.06);
}

.nav-link-active {
  color: var(--c-brand);
  font-weight: 600;
}

.nav-link-active::after {
  content: '';
  position: absolute;
  bottom: 0.15rem;
  left: 0.875rem;
  right: 0.875rem;
  height: 2px;
  border-radius: 1px;
  background: var(--c-brand);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.qq-contact-btn {
  display: none;
  align-items: center;
  gap: 0.4rem;
  height: 2.375rem;
  padding: 0 0.85rem;
  border-radius: var(--radius-md);
  font-size: 0.8125rem;
  font-weight: 600;
  background: var(--bg-surface-solid);
  color: var(--text-primary);
  border: 1px solid var(--border-medium);
  box-shadow: var(--shadow-xs);
  cursor: pointer;
  transition: all 0.2s ease;
}

@media (min-width: 640px) {
  .qq-contact-btn {
    display: inline-flex;
  }
}

.qq-contact-btn:hover {
  color: var(--c-brand);
  border-color: var(--border-strong);
  background: var(--bg-surface-elevated);
}

.qq-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent-emerald);
}

.btn-primary-hdr {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  height: 2.375rem;
  padding: 0 0.95rem;
  border-radius: var(--radius-md);
  font-size: 0.84rem;
  font-weight: 600;
  background: var(--c-brand-600);
  color: #ffffff;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.25);
  transition: all 0.2s ease;
}

.btn-primary-hdr:hover {
  background: var(--c-brand-500);
  box-shadow: var(--shadow-float);
  transform: translateY(-1px);
  color: #ffffff;
}

.icon-sm {
  width: 15px;
  height: 15px;
}

.theme-segment {
  display: inline-flex;
  align-items: center;
  padding: 2px;
  height: 2.375rem;
  border-radius: var(--radius-md);
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-medium);
  box-shadow: var(--shadow-xs);
}

.theme-opt {
  height: 100%;
  padding: 0 0.52rem;
  border: none;
  border-radius: calc(var(--radius-md) - 3px);
  font-size: 0.74rem;
  font-weight: 600;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition:
    background-color 0.18s var(--ease-out-quart),
    color 0.18s var(--ease-out-quart);
}

.theme-opt:hover {
  color: var(--text-primary);
}

.theme-opt-active {
  background: var(--bg-surface-solid);
  color: var(--c-brand-600);
  box-shadow: var(--shadow-xs);
}
</style>
