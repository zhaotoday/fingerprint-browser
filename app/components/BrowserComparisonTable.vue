<script setup lang="ts">
import type { BrowserResource } from '#shared/types/resource'

interface Props {
  browsers: BrowserResource[]
}

defineProps<Props>()
</script>

<template>
  <div class="table-wrapper">
    <table class="comparison-table">
      <thead>
        <tr>
          <th class="col-name">产品名称</th>
          <th class="col-region">阵营</th>
          <th class="col-free">免费额度</th>
          <th class="col-price">参考起步价 (2026.10)</th>
          <th class="col-api">API / MCP / 自动化</th>
          <th class="col-os">支持系统</th>
          <th class="col-action">官网</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="item in browsers"
          :key="item.id"
          :class="{ 'row-recommended': item.recommended }"
        >
          <td class="cell-name">
            <div class="table-brand-wrap">
              <ProductIcon
                :url="item.url"
                :name="item.name"
                :recommended="item.recommended"
                size="sm"
              />
              <a :href="item.url" target="_blank" rel="noopener noreferrer" class="table-brand">
                {{ item.name }}
              </a>
              <span v-if="item.recommended" class="table-rec-tag">⭐</span>
            </div>
          </td>
          <td class="cell-region">
            <span
              class="region-tag"
              :class="item.region === 'domestic' ? 'region-domestic' : 'region-intl'"
            >
              {{ item.region === 'domestic' ? '国内' : '国际' }}
            </span>
          </td>
          <td class="cell-text">{{ item.freeTier }}</td>
          <td class="cell-price">{{ item.startingPrice }}</td>
          <td class="cell-text">{{ item.apiMcpSupport }}</td>
          <td class="cell-text">{{ item.platforms }}</td>
          <td class="cell-action">
            <a :href="item.url" target="_blank" rel="noopener noreferrer" class="table-go-link">
              直达 ↗
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.table-wrapper {
  width: 100%;
  max-height: 620px;
  overflow: auto;
  background: var(--bg-surface-solid);
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
}

.comparison-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8125rem;
  text-align: left;
  table-layout: fixed;
  min-width: 820px;
}

.comparison-table th,
.comparison-table td {
  padding: 0.78rem 0.85rem;
  border-bottom: 1px solid var(--border-subtle);
  vertical-align: middle;
  word-break: break-word;
}

.comparison-table th {
  position: sticky;
  top: 0;
  z-index: 4;
  background: var(--bg-surface-elevated);
  font-family: var(--font-sans);
  font-size: 0.76rem;
  font-weight: 700;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-medium);
}

.col-name {
  width: 17%;
}

.col-region {
  width: 7%;
}

.col-free {
  width: 21%;
}

.col-price {
  width: 20%;
}

.col-api {
  width: 18%;
}

.col-os {
  width: 10%;
}

.col-action {
  width: 7%;
  text-align: center;
}

.comparison-table tbody tr {
  transition: background-color 0.16s ease;
}

.comparison-table tbody tr:hover {
  background: var(--bg-surface-elevated);
}

.row-recommended {
  background: var(--brand-tint-5);
}

.row-recommended td:first-child {
  border-left: 3px solid var(--c-brand-600);
}

.table-brand-wrap {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cell-name {
  font-weight: 700;
}

.table-brand {
  color: var(--text-primary);
}

.table-brand:hover {
  color: var(--c-brand-600);
}

.table-rec-tag {
  display: inline-block;
  font-size: 0.72rem;
}

.region-tag {
  display: inline-block;
  font-size: 0.68rem;
  font-weight: 600;
  padding: 0.12rem 0.42rem;
  border-radius: 5px;
  white-space: nowrap;
}

.region-domestic {
  background: var(--accent-cyan-bg);
  color: var(--c-brand-600);
}

.region-intl {
  background: var(--accent-emerald-bg);
  color: var(--accent-emerald);
}

.cell-text {
  color: var(--text-secondary);
  line-height: 1.5;
}

.cell-price {
  font-family: var(--font-mono);
  color: var(--accent-emerald);
  font-weight: 600;
  line-height: 1.5;
}

.cell-action {
  text-align: center;
}

.table-go-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  white-space: nowrap;
  font-size: 0.73rem;
  font-weight: 600;
  background: var(--accent-cyan-bg);
  color: var(--c-brand-600);
  border: 1px solid var(--accent-cyan-border);
  transition: all 0.16s ease;
}

.table-go-link:hover {
  background: var(--c-brand-600);
  color: #ffffff;
  border-color: var(--c-brand-600);
}
</style>
