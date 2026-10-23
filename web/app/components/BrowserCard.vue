<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import type { BrowserResource } from '#shared/types/resource'

interface Props {
  browser: BrowserResource
}

const props = defineProps<Props>()

const isExpanded = shallowRef(false)

const cardClasses = computed(() => ({
  'browser-card': true,
  'spotlight-surface': true,
  'browser-card-recommended': Boolean(props.browser.recommended),
}))

function onCardMouseMove(e: MouseEvent) {
  const target = e.currentTarget as HTMLElement | null
  if (!target) return
  const rect = target.getBoundingClientRect()
  target.style.setProperty('--mx', `${e.clientX - rect.left}px`)
  target.style.setProperty('--my', `${e.clientY - rect.top}px`)
}
</script>

<template>
  <article
    :id="`browser-${browser.id}`"
    :class="cardClasses"
    @mousemove="onCardMouseMove"
  >
    <div class="card-top">
      <div class="brand-identity">
        <ProductIcon
          :url="browser.url"
          :name="browser.name"
          :recommended="browser.recommended"
        />

        <div class="title-group">
          <div class="title-line">
            <a
              :href="browser.url"
              target="_blank"
              rel="noopener noreferrer"
              class="browser-name-link"
            >
              <h3 class="browser-name">{{ browser.name }}</h3>
            </a>

            <span v-if="browser.recommended" class="badge-rec">⭐ 推荐</span>
          </div>

          <div class="subtitle-line">
            <span class="platform-tag">{{ browser.platforms }}</span>
            <span v-if="browser.secondaryUrl" class="secondary-site-wrap">
              · 官网
              <a
                :href="browser.secondaryUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="secondary-site-link"
              >{{ browser.secondaryLabel }}</a>
            </span>
          </div>
        </div>
      </div>

      <a
        :href="browser.url"
        target="_blank"
        rel="noopener noreferrer"
        class="visit-pill"
        aria-label="访问官网"
      >
        <span>官网</span>
        <span class="visit-arrow" aria-hidden="true">↗</span>
      </a>
    </div>

    <!-- Compact Key-Spec Chips (fzlr style bordered tags) -->
    <div class="spec-ribbon">
      <span class="ribbon-chip ribbon-price" :title="`参考起步价：${browser.startingPrice}`">
        <span class="chip-dot" aria-hidden="true" />
        <span class="chip-text">{{ browser.startingPrice }}</span>
      </span>
      <span class="ribbon-chip" :title="`免费额度：${browser.freeTier}`">
        <span class="chip-text">{{ browser.freeTier }}</span>
      </span>
    </div>

    <!-- Description & Accessible Expand Control -->
    <p
      class="readme-description"
      :class="{ 'readme-description-clamped': !isExpanded }"
    >
      {{ browser.description }}
    </p>

    <div class="card-footer">
      <button
        type="button"
        class="expand-toggle-btn"
        :aria-expanded="isExpanded"
        @click="isExpanded = !isExpanded"
      >
        <span>{{ isExpanded ? '收起完整参数' : '展开完整参数' }}</span>
        <svg
          viewBox="0 0 16 16"
          fill="none"
          class="expand-chevron"
          :class="{ 'expand-chevron-open': isExpanded }"
          aria-hidden="true"
        >
          <path d="M4.5 6.5L8 10l3.5-3.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>

      <span class="billing-meta">{{ browser.billingModel }}</span>
    </div>
  </article>
</template>

<style scoped>
.browser-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
  background: var(--bg-surface-solid);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 1.15rem 1.25rem 1rem;
  box-shadow: var(--shadow-card);
  transition:
    border-color 0.22s var(--ease-out-quart),
    box-shadow 0.22s var(--ease-out-quart),
    transform 0.22s var(--ease-out-quart);
}

.browser-card:hover {
  border-color: var(--border-strong);
  box-shadow: var(--shadow-card-hover);
  transform: translateY(-2px);
}

.browser-card-recommended {
  background: var(--accent-cyan-bg);
  background: color-mix(in srgb, var(--accent-cyan-bg) 45%, var(--bg-surface-solid));
  border-color: var(--accent-cyan-border);
}

.card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.65rem;
  margin-bottom: 0.75rem;
}

.brand-identity {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  min-width: 0;
  flex: 1;
}

.title-group {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.title-line {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
}

.browser-name-link {
  display: inline-flex;
  align-items: center;
  min-width: 0;
}

.browser-name {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: -0.015em;
  color: var(--text-primary);
  transition: color 0.16s ease;
}

.browser-card:hover .browser-name {
  color: var(--c-brand-600);
}

.subtitle-line {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.72rem;
  color: var(--text-muted);
}

.platform-tag {
  font-family: var(--font-mono);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 190px;
}

.secondary-site-wrap {
  color: var(--text-secondary);
}

.secondary-site-link {
  color: var(--c-brand-600);
  font-weight: 600;
}

.secondary-site-link:hover {
  text-decoration: underline;
}

.badge-rec {
  font-size: 0.68rem;
  font-weight: 600;
  padding: 0.08rem 0.42rem;
  border-radius: 5px;
  background: var(--accent-cyan-bg);
  color: var(--c-brand-600);
  border: 1px solid var(--accent-cyan-border);
}

.visit-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  flex-shrink: 0;
  font-size: 0.74rem;
  font-weight: 600;
  color: var(--c-brand-600);
  padding: 0.24rem 0.6rem;
  border-radius: 8px;
  background: var(--accent-cyan-bg);
  border: 1px solid var(--accent-cyan-border);
  transition: all 0.18s ease;
}

.visit-pill:hover {
  background: var(--c-brand-600);
  color: #ffffff;
  border-color: var(--c-brand-600);
}

.visit-arrow {
  transition: transform 0.18s ease;
}

.visit-pill:hover .visit-arrow {
  transform: translate(1px, -1px);
}

.spec-ribbon {
  display: flex;
  flex-wrap: wrap;
  gap: 0.38rem;
  margin-bottom: 0.65rem;
}

.ribbon-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  max-width: 100%;
  font-size: 0.72rem;
  font-weight: 500;
  padding: 0.16rem 0.52rem;
  border-radius: 6px;
  background: var(--bg-surface-solid);
  color: var(--text-secondary);
  border: 1px solid var(--border-medium);
  overflow: hidden;
}

.chip-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ribbon-price {
  font-family: var(--font-mono);
  font-weight: 600;
  background: var(--accent-emerald-bg);
  color: var(--accent-emerald);
  border-color: var(--accent-emerald-border);
}

.chip-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--accent-emerald);
  flex-shrink: 0;
}

.readme-description {
  margin: 0 0 0.7rem;
  font-size: 0.83rem;
  color: var(--text-secondary);
  line-height: 1.65;
}

.readme-description-clamped {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-top: auto;
  padding-top: 0.55rem;
  border-top: 1px solid var(--border-subtle);
}

.expand-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0;
  border: none;
  background: transparent;
  font-size: 0.74rem;
  font-weight: 600;
  color: var(--c-brand-600);
  cursor: pointer;
  flex-shrink: 0;
  transition: color 0.16s ease;
}

.expand-toggle-btn:hover {
  color: var(--c-brand-700);
}

.expand-chevron {
  width: 14px;
  height: 14px;
  transition: transform 0.2s var(--ease-out-quart);
}

.expand-chevron-open {
  transform: rotate(180deg);
}

.billing-meta {
  font-size: 0.7rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
