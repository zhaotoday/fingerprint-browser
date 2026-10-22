<script setup lang="ts">
import { SITE_META } from '#shared/utils/resources-data'

const { totalAllResourcesCount, activeSectionId, setActiveSection } = useResourceNavigation()
</script>

<template>
  <div class="layout-shell">
    <a href="#main-content" class="skip-to-content">跳转到主要内容</a>

    <AppHeader
      :total-count="totalAllResourcesCount"
      :github-url="SITE_META.githubUrl"
      :custom-dev-qq="SITE_META.customDevQq"
      :active-section-id="activeSectionId"
      @select-section="setActiveSection"
    />

    <main id="main-content" class="main-body">
      <slot />
    </main>

    <AppFooter
      :github-url="SITE_META.githubUrl"
      :custom-dev-notice="SITE_META.customDevNotice"
      :pricing-disclaimer="SITE_META.pricingDisclaimer"
    />
  </div>
</template>

<style scoped>
.layout-shell {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

.main-body {
  flex: 1;
}
</style>
