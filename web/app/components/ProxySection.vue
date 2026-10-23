<script setup lang="ts">
import type { ProxyResource, ProxyTypeTag } from '#shared/types/resource'
import { PROXY_TYPE_FILTERS } from '#shared/utils/resources-data'

interface Props {
  proxies: ProxyResource[]
  selectedType: 'all' | ProxyTypeTag
  pricingDisclaimer: string
}

interface Emits {
  updateType: [type: 'all' | ProxyTypeTag]
}

defineProps<Props>()
const emit = defineEmits<Emits>()
</script>

<template>
  <section id="section-proxies" class="resource-section" aria-labelledby="heading-proxies">
    <div class="section-header-bar">
      <div class="header-main">
        <div class="title-row">
          <span class="section-accent-sq" aria-hidden="true" />
          <h2 id="heading-proxies" class="section-title">
            代理 IP
          </h2>
          <span class="section-count-badge">{{ proxies.length }} 项</span>
        </div>
        <p class="section-disclaimer">{{ pricingDisclaimer }}</p>
      </div>
    </div>

    <div class="filter-bar">
      <div class="filter-pills">
        <button
          v-for="item in PROXY_TYPE_FILTERS"
          :key="item.id"
          type="button"
          class="filter-pill"
          :class="{ 'filter-pill-active': selectedType === item.id }"
          @click="emit('updateType', selectedType === item.id && item.id !== 'all' ? 'all' : item.id)"
        >
          {{ item.label }}
        </button>
      </div>
    </div>

    <div v-if="proxies.length === 0" class="empty-box">
      <div class="empty-icon-wrap" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" class="empty-icon">
          <circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.6" />
          <path d="M4 12h16M12 4c2.2 2.4 3.2 5.1 3.2 8s-1 5.6-3.2 8c-2.2-2.4-3.2-5.1-3.2-8s1-5.6 3.2-8z" stroke="currentColor" stroke-width="1.5" />
        </svg>
      </div>
      <h3 class="empty-title">未找到匹配的代理 IP 服务商</h3>
      <p class="empty-desc">尝试切换动态住宅、静态 ISP 或流量不过期等筛选条件，恢复展示全部 34 家渠道。</p>
      <button type="button" class="empty-reset-btn" @click="emit('updateType', 'all')">
        显示全部代理
      </button>
    </div>

    <div v-else class="proxy-grid">
      <ProxyCard
        v-for="proxy in proxies"
        :key="proxy.id"
        :proxy="proxy"
      />
    </div>
  </section>
</template>

<style scoped>
.resource-section {
  margin-bottom: 2.75rem;
  scroll-margin-top: 84px;
}

.section-header-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.35rem;
}

.section-accent-sq {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  background: var(--c-brand-600);
}

.section-title {
  margin: 0;
  font-size: clamp(1.35rem, 2vw, 1.65rem);
  font-weight: 700;
  letter-spacing: -0.025em;
  color: var(--text-primary);
}

.section-count-badge {
  font-family: var(--font-mono);
  font-size: 0.74rem;
  font-weight: 600;
  padding: 0.14rem 0.55rem;
  border-radius: 6px;
  background: var(--accent-cyan-bg);
  color: var(--c-brand-600);
  border: 1px solid var(--accent-cyan-border);
}

.section-disclaimer {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--text-muted);
}

.filter-bar {
  padding: 0.6rem 0.8rem;
  margin-bottom: 1.25rem;
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
}

.filter-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.filter-pill {
  height: 29px;
  display: inline-flex;
  align-items: center;
  padding: 0 0.7rem;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 500;
  background: var(--bg-surface-solid);
  color: var(--text-secondary);
  border: 1px solid var(--border-medium);
  cursor: pointer;
  transition: all 0.18s ease;
}

.filter-pill:hover {
  border-color: var(--border-strong);
  color: var(--c-brand);
  background: var(--accent-cyan-bg);
}

.filter-pill-active {
  background: var(--c-brand-600);
  color: #ffffff;
  border-color: var(--c-brand-600);
  font-weight: 600;
}

.filter-pill-active:hover {
  background: var(--c-brand-700);
  color: #ffffff;
}

.proxy-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.9rem;
}

@media (min-width: 680px) {
  .proxy-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1180px) {
  .proxy-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.empty-box {
  padding: 2.35rem 1.5rem 2.5rem;
  text-align: center;
  background: var(--bg-surface-elevated);
  border: 1px dashed var(--border-medium);
  border-radius: var(--radius-lg);
}

.empty-icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: var(--radius-md);
  background: var(--accent-cyan-bg);
  color: var(--c-brand-600);
  border: 1px solid var(--accent-cyan-border);
  margin-bottom: 0.65rem;
}

.empty-icon {
  width: 18px;
  height: 18px;
}

.empty-title {
  margin: 0 0 0.35rem;
  font-size: 0.96rem;
  font-weight: 700;
  color: var(--text-primary);
}

.empty-desc {
  margin: 0 auto 0.95rem;
  font-size: 0.84rem;
  color: var(--text-muted);
  max-width: 44ch;
}

.empty-reset-btn {
  padding: 0.42rem 0.95rem;
  border-radius: var(--radius-sm);
  font-size: 0.78rem;
  font-weight: 600;
  background: var(--c-brand-600);
  color: #ffffff;
  border: none;
  cursor: pointer;
  transition: background-color 0.18s var(--ease-out-quart);
}

.empty-reset-btn:hover {
  background: var(--c-brand-700);
}
</style>
