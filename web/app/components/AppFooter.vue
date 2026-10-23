<script setup lang="ts">
interface Props {
  githubUrl: string
  customDevNotice: string
  pricingDisclaimer: string
}

defineProps<Props>()
</script>

<template>
  <footer class="site-footer">
    <div class="container-shell footer-inner">
      <div class="footer-left">
        <div class="footer-brand-row">
          <svg width="28" height="28" viewBox="0 0 64 64" fill="none" aria-hidden="true" class="footer-logo">
            <rect width="64" height="64" rx="14" fill="#3b82f6" />
            <path d="M18 35C18 26.7157 24.268 20 32 20C39.732 20 46 26.7157 46 35C46 38.8 44.8 42.3 42.7 45" stroke="#ffffff" stroke-width="4" stroke-linecap="round" />
            <path d="M24 35.5C24 30.8056 27.5817 27 32 27C36.4183 27 40 30.8056 40 35.5C40 41.2 37.8 46.2 34.2 49.5" stroke="#ffffff" stroke-width="4" stroke-linecap="round" />
            <circle cx="32" cy="33.5" r="3" fill="#34d399" />
          </svg>
          <span class="footer-brand">指纹浏览器（防关联浏览器）资源整理</span>
        </div>
        <p class="footer-note">{{ pricingDisclaimer }}</p>
        <p class="footer-dev">专业接单：{{ customDevNotice }}</p>
      </div>

      <div class="footer-right">
        <a :href="githubUrl" target="_blank" rel="noopener noreferrer" class="footer-link">
          GitHub 仓库 ↗
        </a>
        <a :href="`${githubUrl}#readme`" target="_blank" rel="noopener noreferrer" class="footer-link">
          免责声明与隐私条款 ↗
        </a>
        <a href="/llms.txt" target="_blank" rel="noopener" class="footer-link">
          llms.txt
        </a>
        <a href="/llms-full.txt" target="_blank" rel="noopener" class="footer-link">
          llms-full.txt
        </a>
        <a href="/api/resources" target="_blank" rel="noopener" class="footer-link">
          API
        </a>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  margin-top: 2rem;
  padding: 2.5rem 0 2.75rem;
  background: var(--bg-surface-elevated);
  border-top: 1px solid var(--border-subtle);
}

.footer-inner {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1.5rem;
}

@media (min-width: 900px) {
  .footer-inner {
    flex-direction: row;
    align-items: center;
  }
}

.footer-brand-row {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  margin-bottom: 0.45rem;
}

.footer-logo {
  flex-shrink: 0;
}

.footer-brand {
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text-primary);
}

.footer-note {
  margin: 0 0 0.25rem;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.footer-dev {
  margin: 0;
  font-size: 0.83rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.footer-right {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.footer-link {
  font-size: 0.76rem;
  font-family: var(--font-mono);
  font-weight: 500;
  color: var(--text-secondary);
  padding: 0.28rem 0.65rem;
  border-radius: 6px;
  background: var(--bg-surface-solid);
  border: 1px solid var(--border-medium);
  box-shadow: var(--shadow-xs);
  transition: all 0.16s ease;
}

.footer-link:hover {
  color: var(--c-brand-600);
  border-color: var(--border-strong);
  background: var(--accent-cyan-bg);
}
</style>
