<script setup lang="ts">
import type { DirectoryCategory } from '#shared/types/resource'

interface Props {
  category: DirectoryCategory
}

defineProps<Props>()
</script>

<template>
  <section
    :id="`section-${category.id}`"
    class="directory-section"
    :aria-labelledby="`heading-${category.id}`"
  >
    <div class="dir-header">
      <div class="dir-title-wrap">
        <span class="section-accent-sq" aria-hidden="true" />
        <h2 :id="`heading-${category.id}`" class="dir-title">
          {{ category.title }}
        </h2>
        <span class="dir-count">{{ category.items.length }} 项</span>
      </div>
    </div>

    <div class="dir-grid">
      <ResourceLinkCard
        v-for="item in category.items"
        :key="item.id"
        :item="item"
      />
    </div>
  </section>
</template>

<style scoped>
.directory-section {
  margin-bottom: 2.35rem;
  scroll-margin-top: 84px;
}

.dir-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.85rem;
  padding-bottom: 0.48rem;
  border-bottom: 1px solid var(--border-subtle);
}

.dir-title-wrap {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}

.section-accent-sq {
  width: 7px;
  height: 7px;
  border-radius: 2px;
  background: var(--c-brand-600);
}

.dir-title {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text-primary);
}

.dir-count {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.1rem 0.5rem;
  border-radius: 6px;
  background: var(--accent-cyan-bg);
  color: var(--c-brand-600);
  border: 1px solid var(--accent-cyan-border);
}

.dir-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.65rem;
}

@media (min-width: 640px) {
  .dir-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .dir-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
