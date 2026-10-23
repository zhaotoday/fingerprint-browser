<script setup lang="ts">
import type { OpenSourceSubcategory } from '#shared/types/resource'

interface Props {
  allSubcategories: OpenSourceSubcategory[]
  filteredSubcategories: OpenSourceSubcategory[]
  selectedSubcategoryId: string
  totalCount: number
}

interface Emits {
  updateSubcategory: [id: string]
}

defineProps<Props>()
const emit = defineEmits<Emits>()
</script>

<template>
  <section id="section-opensource" class="resource-section" aria-labelledby="heading-opensource">
    <div class="section-header">
      <div class="title-row">
        <span class="section-accent-sq" aria-hidden="true" />
        <h2 id="heading-opensource" class="section-title">
          开源
        </h2>
        <span class="section-count-badge">{{ totalCount }} 项</span>
      </div>
    </div>

    <div class="subcategory-bar">
      <button
        type="button"
        class="sub-pill"
        :class="{ 'sub-pill-active': selectedSubcategoryId === 'all' }"
        @click="emit('updateSubcategory', 'all')"
      >
        全部 ({{ allSubcategories.length }})
      </button>
      <button
        v-for="sub in allSubcategories"
        :key="sub.id"
        type="button"
        class="sub-pill"
        :class="{ 'sub-pill-active': selectedSubcategoryId === sub.id }"
        @click="emit('updateSubcategory', selectedSubcategoryId === sub.id ? 'all' : sub.id)"
      >
        {{ sub.title }}
        <span class="sub-pill-count">{{ sub.items.length }}</span>
      </button>
    </div>

    <div v-if="filteredSubcategories.length === 0" class="empty-box">
      <div class="empty-icon-wrap" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" class="empty-icon">
          <path d="M8 8L4 12l4 4M16 8l4 4-4 4M13.5 6l-3 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
      <h3 class="empty-title">未找到匹配的开源项目</h3>
      <p class="empty-desc">尝试切换 16 个开源子分类或清空顶部搜索词，浏览全部反检测与内核定制仓库。</p>
      <button type="button" class="empty-reset-btn" @click="emit('updateSubcategory', 'all')">
        显示全部分类
      </button>
    </div>

    <div v-else class="os-groups-stack">
      <div
        v-for="(sub, idx) in filteredSubcategories"
        :key="sub.id"
        :id="`os-group-${sub.id}`"
        class="os-group"
      >
        <div class="os-group-header">
          <div class="os-group-left">
            <span class="os-group-idx">{{ String(idx + 1).padStart(2, '0') }}</span>
            <h3 class="os-group-title">{{ sub.title }}</h3>
          </div>
          <span class="os-group-badge">{{ sub.items.length }} 项</span>
        </div>

        <div class="os-items-grid">
          <ResourceLinkCard
            v-for="item in sub.items"
            :key="item.id"
            :item="item"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.resource-section {
  margin-bottom: 2.75rem;
  scroll-margin-top: 84px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.9rem;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
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

.subcategory-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  padding: 0.6rem 0.8rem;
  margin-bottom: 1.35rem;
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
}

.sub-pill {
  height: 29px;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0 0.68rem;
  border-radius: 6px;
  font-size: 0.76rem;
  font-weight: 500;
  background: var(--bg-surface-solid);
  color: var(--text-secondary);
  border: 1px solid var(--border-medium);
  cursor: pointer;
  transition: all 0.18s ease;
}

.sub-pill:hover {
  border-color: var(--border-strong);
  color: var(--c-brand);
  background: var(--accent-cyan-bg);
}

.sub-pill-count {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  opacity: 0.75;
}

.sub-pill-active {
  background: var(--c-brand-600);
  color: #ffffff;
  border-color: var(--c-brand-600);
  font-weight: 600;
}

.sub-pill-active:hover {
  background: var(--c-brand-700);
  color: #ffffff;
}

.os-groups-stack {
  display: flex;
  flex-direction: column;
  gap: 1.55rem;
}

.os-group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.65rem;
  padding-bottom: 0.42rem;
  border-bottom: 1px solid var(--border-subtle);
}

.os-group-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.os-group-idx {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  font-weight: 600;
  padding: 0.08rem 0.42rem;
  border-radius: 5px;
  background: var(--accent-cyan-bg);
  color: var(--c-brand-600);
  border: 1px solid var(--accent-cyan-border);
}

.os-group-title {
  margin: 0;
  font-size: 0.96rem;
  font-weight: 700;
  color: var(--text-primary);
}

.os-group-badge {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.08rem 0.48rem;
  border-radius: 6px;
  background: var(--bg-surface-elevated);
  color: var(--text-secondary);
  border: 1px solid var(--border-subtle);
}

.os-items-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.65rem;
}

@media (min-width: 640px) {
  .os-items-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .os-items-grid {
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
