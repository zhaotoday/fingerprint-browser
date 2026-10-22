<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'

interface Props {
  url: string
  name: string
  recommended?: boolean
  size?: 'sm' | 'md'
}

const props = withDefaults(defineProps<Props>(), {
  recommended: false,
  size: 'md',
})

const imgFailed = shallowRef(false)

watch(
  () => props.url,
  () => {
    imgFailed.value = false
  }
)

const domain = computed(() => {
  try {
    return new URL(props.url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
})

const faviconUrl = computed(() => {
  if (!domain.value) return ''
  return `https://icon.horse/icon/${domain.value}`
})

const monogram = computed(() => {
  const clean = props.name.trim()
  return clean ? clean.charAt(0).toUpperCase() : 'B'
})
</script>

<template>
  <span
    class="product-icon-tile"
    :class="[
      `tile-${size}`,
      { 'tile-recommended': recommended, 'tile-fallback': imgFailed || !faviconUrl }
    ]"
    aria-hidden="true"
  >
    <img
      v-if="faviconUrl && !imgFailed"
      :src="faviconUrl"
      :alt="`${name} 图标`"
      class="favicon-img"
      loading="lazy"
      decoding="async"
      @error="imgFailed = true"
    />
    <span v-else class="fallback-monogram">{{ monogram }}</span>
  </span>
</template>

<style scoped>
.product-icon-tile {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: var(--bg-surface-solid);
  border: 1px solid var(--border-medium);
  box-shadow: var(--shadow-xs);
  overflow: hidden;
  user-select: none;
}

.tile-md {
  width: 38px;
  height: 38px;
  border-radius: 10px;
}

.tile-sm {
  width: 26px;
  height: 26px;
  border-radius: 7px;
}

.tile-recommended {
  border-color: var(--accent-cyan-border);
  background: var(--accent-cyan-bg);
}

.tile-fallback {
  background: var(--accent-cyan-bg);
  border-color: var(--accent-cyan-border);
  color: var(--accent-primary);
}

.favicon-img {
  width: 68%;
  height: 68%;
  object-fit: contain;
  display: block;
  border-radius: 4px;
}

.fallback-monogram {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--accent-primary);
  line-height: 1;
}

.tile-sm .fallback-monogram {
  font-size: 0.72rem;
}
</style>
