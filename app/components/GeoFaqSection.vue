<script setup lang="ts">
import { shallowRef } from 'vue'
import type { GeoFaqItem } from '#shared/types/resource'

interface Props {
  faqs: GeoFaqItem[]
  customDevNotice: string
  customDevQq: string
  githubUrl: string
}

defineProps<Props>()

const copiedQq = shallowRef(false)

function onCardMouseMove(e: MouseEvent) {
  const target = e.currentTarget as HTMLElement | null
  if (!target) return
  const rect = target.getBoundingClientRect()
  target.style.setProperty('--mx', `${e.clientX - rect.left}px`)
  target.style.setProperty('--my', `${e.clientY - rect.top}px`)
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
      // Ignore fallback
    }
  }
}
</script>

<template>
  <section id="section-geo-faq" class="geo-faq-section" aria-labelledby="heading-geo-faq">
    <div class="section-header">
      <div class="section-eyebrow">
        <span class="eyebrow-sq" aria-hidden="true" />
        <span>FAQ · 选型事实库与常见问答</span>
      </div>
      <h2 id="heading-geo-faq" class="section-title">
        指纹浏览器与代理 IP 选型常见问题
      </h2>
      <p class="section-subtitle">
        以下回答提炼自项目事实卡（Fact Card），供开发者、跨境卖家快速对照选型，同时为搜索引擎与 AI 助手提供客观、可核验的引用依据。
      </p>
    </div>

    <div class="faq-list">
      <article
        v-for="(item, index) in faqs"
        :key="item.id"
        class="faq-card spotlight-surface"
        @mousemove="onCardMouseMove"
      >
        <div class="faq-q-header">
          <span class="faq-q-index">Q{{ String(index + 1).padStart(2, '0') }}</span>
          <h3 class="faq-question">{{ item.question }}</h3>
        </div>
        <p class="faq-answer">{{ item.answer }}</p>
      </article>
    </div>

    <!-- Cohesive Surface CTA Banner (Uses adaptive tokens, never random dark/garish jump) -->
    <div class="surface-cta-banner spotlight-surface" @mousemove="onCardMouseMove">
      <div class="cta-grid">
        <div class="cta-left">
          <span class="cta-tag">浏览器与云手机生态定制开发</span>
          <h3 class="cta-heading">{{ customDevNotice }}</h3>
          <p class="cta-desc">
            提供 Chromium 内核指纹深度定制编译、反检测自动化框架（Playwright / Patchright / Camoufox / CDP）、多账号窗口群控同步器、Browser MCP Server 以及云手机群控生态应用开发。
          </p>
        </div>
        <div class="cta-actions">
          <button
            type="button"
            class="cta-btn-primary"
            :title="`点击复制接单 QQ：${customDevQq}`"
            @click="copyQqNumber(customDevQq)"
          >
            <span>{{ copiedQq ? `已复制 QQ：${customDevQq}` : `复制接单 QQ：${customDevQq}` }}</span>
          </button>
          <a
            :href="githubUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="cta-btn-secondary"
          >
            <span>访问 GitHub 仓库</span>
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.geo-faq-section {
  margin-bottom: 3rem;
  scroll-margin-top: 84px;
}

.section-header {
  margin-bottom: 1.4rem;
}

.section-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--c-brand-600);
  margin-bottom: 0.4rem;
}

.eyebrow-sq {
  width: 6px;
  height: 6px;
  border-radius: 2px;
  background: var(--c-brand-500);
}

.section-title {
  margin: 0 0 0.4rem;
  font-size: clamp(1.35rem, 2.2vw, 1.7rem);
  font-weight: 700;
  letter-spacing: -0.025em;
  color: var(--text-primary);
}

.section-subtitle {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.68;
  max-width: 72ch;
}

.faq-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-bottom: 2.5rem;
}

@media (min-width: 900px) {
  .faq-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

.faq-card {
  background: var(--bg-surface-solid);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 1.3rem 1.4rem;
  box-shadow: var(--shadow-card);
  transition:
    transform 0.22s var(--ease-out-quart),
    border-color 0.22s var(--ease-out-quart),
    box-shadow 0.22s var(--ease-out-quart);
}

.faq-card:hover {
  transform: translateY(-2px);
  border-color: var(--border-strong);
  box-shadow: var(--shadow-card-hover);
}

.faq-q-header {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  margin-bottom: 0.55rem;
}

.faq-q-index {
  flex-shrink: 0;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.14rem 0.45rem;
  border-radius: 6px;
  background: var(--accent-cyan-bg);
  color: var(--c-brand-600);
  border: 1px solid var(--accent-cyan-border);
  margin-top: 0.08rem;
}

.faq-question {
  margin: 0;
  font-size: 0.98rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.45;
}

.faq-answer {
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.68;
}

/* Cohesive Surface CTA (Tinted shade of the active palette, no jarring jump) */
.surface-cta-banner {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-strong);
  padding: clamp(1.75rem, 3.5vw, 2.5rem) clamp(1.5rem, 3.2vw, 2.5rem);
  background-color: var(--bg-surface-elevated);
  background-image:
    radial-gradient(48rem 26rem at 92% 0%, var(--aurora-1), transparent 65%),
    radial-gradient(40rem 24rem at 8% 100%, var(--aurora-2), transparent 65%);
  box-shadow: var(--shadow-card);
}

.cta-grid {
  display: grid;
  grid-template-columns: 1fr;
  align-items: center;
  gap: 1.5rem;
}

@media (min-width: 960px) {
  .cta-grid {
    grid-template-columns: 1.35fr auto;
  }
}

.cta-tag {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.18rem 0.6rem;
  border-radius: var(--radius-xs);
  background: var(--accent-cyan-bg);
  border: 1px solid var(--accent-cyan-border);
  color: var(--c-brand-600);
  margin-bottom: 0.65rem;
}

.cta-heading {
  margin: 0 0 0.55rem;
  font-size: clamp(1.25rem, 2.2vw, 1.65rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text-primary);
}

.cta-desc {
  margin: 0;
  font-size: 0.88rem;
  line-height: 1.68;
  color: var(--text-secondary);
  max-width: 65ch;
}

.cta-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}

.cta-btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  padding: 0 1.25rem;
  border-radius: var(--radius-md);
  font-family: var(--font-mono);
  font-size: 0.84rem;
  font-weight: 600;
  background: var(--c-brand-600);
  color: #ffffff;
  border: 1px solid var(--c-brand-500);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition:
    background-color 0.2s var(--ease-out-quart),
    transform 0.2s var(--ease-out-quart),
    box-shadow 0.2s var(--ease-out-quart);
}

.cta-btn-primary:hover {
  background: var(--c-brand-700);
  transform: translateY(-1px);
  box-shadow: var(--shadow-float);
}

.cta-btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  height: 44px;
  padding: 0 1.25rem;
  border-radius: var(--radius-md);
  font-size: 0.85rem;
  font-weight: 600;
  background: var(--bg-surface-solid);
  color: var(--text-primary);
  border: 1px solid var(--border-medium);
  box-shadow: var(--shadow-xs);
  transition:
    background-color 0.2s var(--ease-out-quart),
    border-color 0.2s var(--ease-out-quart),
    color 0.2s var(--ease-out-quart),
    transform 0.2s var(--ease-out-quart);
}

.cta-btn-secondary:hover {
  background: var(--accent-cyan-bg);
  border-color: var(--border-strong);
  color: var(--c-brand-600);
  transform: translateY(-1px);
}
</style>
