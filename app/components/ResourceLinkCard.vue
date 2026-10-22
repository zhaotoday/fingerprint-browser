<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'
import type { SimpleResourceItem } from '#shared/types/resource'

interface Props {
  item: SimpleResourceItem
}

const props = defineProps<Props>()

const imgFailed = shallowRef(false)

watch(
  () => props.item.url,
  () => {
    imgFailed.value = false
  }
)

const linkType = computed(() => {
  if (props.item.repoPath) return 'github'
  if (props.item.category === 'videos' || props.item.category === 'bilibili-channels') return 'video'
  if (props.item.category === 'articles') return 'article'
  return 'web'
})

const showFavicon = computed(() => {
  return linkType.value === 'web' && props.item.domain && !imgFailed.value
})

const faviconUrl = computed(() => {
  if (!props.item.domain) return ''
  return `https://icon.horse/icon/${props.item.domain.replace(/^www\./, '')}`
})

function onCardMouseMove(e: MouseEvent) {
  const target = e.currentTarget as HTMLElement | null
  if (!target) return
  const rect = target.getBoundingClientRect()
  target.style.setProperty('--mx', `${e.clientX - rect.left}px`)
  target.style.setProperty('--my', `${e.clientY - rect.top}px`)
}
</script>

<template>
  <a
    :href="item.url"
    target="_blank"
    rel="noopener noreferrer"
    class="link-card spotlight-surface"
    :title="`${item.title} (${item.url})`"
    @mousemove="onCardMouseMove"
  >
    <div class="link-left">
      <span class="link-icon" :class="`link-icon-${linkType}`" aria-hidden="true">
        <img
          v-if="showFavicon"
          :src="faviconUrl"
          :alt="`${item.title} 图标`"
          class="web-favicon"
          loading="lazy"
          decoding="async"
          @error="imgFailed = true"
        />
        <svg v-else-if="linkType === 'github'" viewBox="0 0 16 16" fill="currentColor" class="mini-svg">
          <path
            d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
          />
        </svg>
        <svg v-else-if="linkType === 'video'" viewBox="0 0 16 16" fill="none" class="mini-svg">
          <path d="M5.5 4.2L11.8 8l-6.3 3.8V4.2z" fill="currentColor" />
        </svg>
        <svg v-else-if="linkType === 'article'" viewBox="0 0 16 16" fill="none" class="mini-svg">
          <path d="M3.5 4.5h9M3.5 8h9M3.5 11.5h5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
        <svg v-else viewBox="0 0 16 16" fill="none" class="mini-svg">
          <circle cx="8" cy="8" r="5.5" stroke="currentColor" stroke-width="1.4" />
          <path d="M2.8 8h10.4M8 2.5c1.5 1.6 2.2 3.5 2.2 5.5S9.5 11.9 8 13.5c-1.5-1.6-2.2-3.5-2.2-5.5S6.5 4.1 8 2.5z" stroke="currentColor" stroke-width="1.2" />
        </svg>
      </span>
      <span class="link-title">{{ item.title }}</span>
    </div>

    <span class="link-meta">
      <span class="link-source">{{ item.repoPath || item.domain }}</span>
      <span class="link-arrow" aria-hidden="true">↗</span>
    </span>
  </a>
</template>

<style scoped>
.link-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.65rem;
  width: 100%;
  min-width: 0;
  height: 46px;
  padding: 0 0.9rem;
  background: var(--bg-surface-solid);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-xs);
  overflow: hidden;
  transition:
    border-color 0.2s var(--ease-out-quart),
    box-shadow 0.2s var(--ease-out-quart),
    transform 0.2s var(--ease-out-quart);
}

.link-card:hover {
  border-color: var(--border-strong);
  box-shadow: var(--shadow-card);
  transform: translateY(-1.5px);
}

.link-left {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.link-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 7px;
  background: var(--bg-surface-elevated);
  color: var(--text-secondary);
  border: 1px solid var(--border-subtle);
  flex-shrink: 0;
  overflow: hidden;
  transition: all 0.2s ease;
}

.web-favicon {
  width: 68%;
  height: 68%;
  object-fit: contain;
  display: block;
}

.link-icon-video {
  background: var(--accent-cyan-bg);
  color: var(--c-brand-600);
  border-color: var(--accent-cyan-border);
}

.link-icon-article {
  background: var(--accent-emerald-bg);
  color: var(--accent-emerald);
  border-color: var(--accent-emerald-border);
}

.link-card:hover .link-icon {
  border-color: var(--accent-cyan-border);
  color: var(--c-brand-600);
}

.mini-svg {
  width: 13px;
  height: 13px;
}

.link-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.16s ease;
}

.link-card:hover .link-title {
  color: var(--c-brand-600);
}

.link-meta {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  flex-shrink: 0;
  max-width: 136px;
}

.link-source {
  font-size: 0.68rem;
  font-family: var(--font-mono);
  color: var(--text-muted);
  padding: 0.1rem 0.42rem;
  border-radius: 5px;
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-subtle);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 114px;
  transition: all 0.16s ease;
}

.link-arrow {
  font-size: 0.74rem;
  color: var(--text-faint);
  flex-shrink: 0;
  transition: transform 0.18s ease, color 0.18s ease;
}

.link-card:hover .link-source {
  color: var(--c-brand-600);
  background: var(--accent-cyan-bg);
  border-color: var(--accent-cyan-border);
}

.link-card:hover .link-arrow {
  color: var(--c-brand-600);
  transform: translate(1.5px, -1.5px);
}
</style>
