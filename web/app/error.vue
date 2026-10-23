<script setup lang="ts">
import type { NuxtError } from '#app'

interface Props {
  error?: NuxtError
}

defineProps<Props>()

function handleBackHome() {
  clearError({ redirect: '/' })
}

function onCardMouseMove(e: MouseEvent) {
  const target = e.currentTarget as HTMLElement | null
  if (!target) return
  const rect = target.getBoundingClientRect()
  target.style.setProperty('--mx', `${e.clientX - rect.left}px`)
  target.style.setProperty('--my', `${e.clientY - rect.top}px`)
}
</script>

<template>
  <div class="error-page">
    <div class="container-shell error-container">
      <div class="error-card spotlight-surface" @mousemove="onCardMouseMove">
        <span class="error-code">ERROR {{ error?.statusCode || 404 }}</span>
        <h1 class="error-title">未找到请求的页面</h1>
        <p class="error-desc">
          {{ error?.message || '您访问的链接不存在或已被移动。请返回指纹浏览器与代理 IP 导航首页继续检索。' }}
        </p>
        <div class="error-actions">
          <button type="button" class="back-home-btn" @click="handleBackHome">
            返回资源导航首页 →
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.error-page {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
}

.error-container {
  display: flex;
  justify-content: center;
}

.error-card {
  width: 100%;
  max-width: 520px;
  padding: 2.5rem 2.25rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
  text-align: left;
}

.error-code {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 0.74rem;
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  border-radius: var(--radius-xs);
  background: var(--accent-cyan-bg);
  color: var(--accent-primary);
  border: 1px solid var(--accent-cyan-border);
  margin-bottom: 0.9rem;
}

.error-title {
  margin: 0 0 0.55rem;
  font-size: 1.65rem;
  font-weight: 600;
  letter-spacing: -0.025em;
  color: var(--text-primary);
}

.error-desc {
  margin: 0 0 1.6rem;
  font-size: 0.92rem;
  color: var(--text-secondary);
  line-height: 1.65;
}

.error-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.back-home-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  height: 44px;
  padding: 0 1.25rem;
  border-radius: var(--radius-lg);
  font-size: 0.88rem;
  font-weight: 500;
  background: var(--accent-primary);
  color: var(--brand-fg);
  border: none;
  cursor: pointer;
  transition: background-color 0.18s var(--ease-out-quart);
}

.back-home-btn:hover {
  background: var(--accent-primary-hover);
}
</style>
