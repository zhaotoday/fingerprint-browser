<script setup lang="ts">
interface SidebarItem {
  id: string
  label: string
  count: number
  total: number
}

interface Props {
  sections: SidebarItem[]
  activeSectionId: string
}

interface Emits {
  selectSection: [sectionId: string]
}

defineProps<Props>()
const emit = defineEmits<Emits>()

function onNavigate(id: string) {
  emit('selectSection', id)
}

function scrollToTop() {
  if (import.meta.client) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}
</script>

<template>
  <aside class="category-sidebar" aria-label="浮动目录导航">
    <div class="sidebar-card">
      <div class="sidebar-header">
        <div class="sidebar-header-left">
          <span class="sidebar-sq" aria-hidden="true" />
          <span class="sidebar-title">目录导航</span>
        </div>
        <button
          type="button"
          class="sidebar-top-btn"
          title="回到页面顶部"
          @click="scrollToTop"
        >
          顶部 ↑
        </button>
      </div>

      <nav class="sidebar-nav" aria-label="章节列表">
        <a
          v-for="sec in sections"
          :key="sec.id"
          :href="`#${sec.id}`"
          class="sidebar-link"
          :class="{ 'sidebar-link-active': activeSectionId === sec.id }"
          @click="onNavigate(sec.id)"
        >
          <span class="sidebar-link-label">{{ sec.label }}</span>
          <span class="sidebar-count" :class="{ 'sidebar-count-zero': sec.count === 0 }">
            {{ sec.count }}
          </span>
        </a>
      </nav>
    </div>
  </aside>
</template>

<style scoped>
.category-sidebar {
  width: 100%;
  z-index: var(--z-sticky);
}

@media (min-width: 1024px) {
  .category-sidebar {
    position: sticky;
    top: 84px;
    align-self: flex-start;
    width: 216px;
    flex-shrink: 0;
  }

  .sidebar-card {
    max-height: calc(100dvh - 102px);
    overflow-y: auto;
  }
}

.sidebar-card {
  background: var(--bg-surface-solid);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 0.9rem;
  box-shadow: var(--shadow-card);
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.45rem;
  margin-bottom: 0.6rem;
  padding: 0 0.35rem 0.55rem;
  border-bottom: 1px solid var(--border-subtle);
}

.sidebar-header-left {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.sidebar-sq {
  width: 6px;
  height: 6px;
  border-radius: 2px;
  background: var(--c-brand-600);
}

.sidebar-title {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-primary);
}

.sidebar-top-btn {
  padding: 0.14rem 0.48rem;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 600;
  background: var(--bg-surface-elevated);
  color: var(--text-secondary);
  border: 1px solid var(--border-subtle);
  cursor: pointer;
  transition: all 0.16s ease;
}

.sidebar-top-btn:hover {
  background: var(--accent-cyan-bg);
  color: var(--c-brand-600);
  border-color: var(--accent-cyan-border);
}

.sidebar-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

@media (min-width: 1024px) {
  .sidebar-nav {
    flex-direction: column;
    gap: 0.15rem;
  }
}

.sidebar-link {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.4rem 0.6rem;
  border-radius: var(--radius-sm);
  font-size: 0.83rem;
  font-weight: 500;
  color: var(--text-secondary);
  transition: all 0.16s ease;
}

.sidebar-link:hover {
  background: var(--bg-surface-elevated);
  color: var(--c-brand-600);
}

.sidebar-link-active {
  background: var(--accent-cyan-bg);
  color: var(--c-brand-600);
  font-weight: 600;
}

.sidebar-link-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 22%;
  bottom: 22%;
  width: 3px;
  border-radius: 0 2px 2px 0;
  background: var(--c-brand-600);
}

.sidebar-link-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-count {
  font-size: 0.7rem;
  font-family: var(--font-mono);
  font-weight: 600;
  padding: 0.04rem 0.4rem;
  border-radius: 6px;
  background: var(--bg-surface-elevated);
  color: var(--text-muted);
  border: 1px solid var(--border-subtle);
}

.sidebar-link-active .sidebar-count {
  background: var(--c-brand-600);
  color: #ffffff;
  border-color: var(--c-brand-600);
}

.sidebar-count-zero {
  opacity: 0.35;
}
</style>
