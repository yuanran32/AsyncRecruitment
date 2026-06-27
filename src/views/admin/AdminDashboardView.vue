<template>
  <div class="page">
    <PageHeader title="仪表盘" description="查看招新核心指标和待处理事项。" />

    <div class="metric-grid" v-loading="loading">
      <div class="metric-card">
        <span class="muted">注册人数</span>
        <strong>{{ summary.userCount }}</strong>
      </div>
      <div class="metric-card">
        <span class="muted">报名申请</span>
        <strong>{{ summary.applicationCount }}</strong>
      </div>
      <div class="metric-card">
        <span class="muted">已分组申请</span>
        <strong>{{ summary.groupedApplicationCount }}</strong>
      </div>
      <div class="metric-card">
        <span class="muted">未分配申请</span>
        <strong>{{ summary.unassignedApplicationCount }}</strong>
      </div>
      <div class="metric-card">
        <span class="muted">负责人</span>
        <strong>{{ summary.leaderCount }}</strong>
      </div>
      <div class="metric-card">
        <span class="muted">任务完成率</span>
        <strong>{{ Math.round(summary.taskCompletionRate * 100) }}%</strong>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';

import { getDashboardSummary } from '@/api/admin';
import PageHeader from '@/components/common/PageHeader.vue';
import type { AdminDashboardSummary } from '@/types/api';

const loading = ref(false);
const summary = reactive<AdminDashboardSummary>({
  userCount: 0,
  applicationCount: 0,
  groupedUserCount: 0,
  groupedApplicationCount: 0,
  unassignedApplicationCount: 0,
  leaderCount: 0,
  taskCompletionRate: 0
});

onMounted(loadSummary);

async function loadSummary() {
  loading.value = true;
  try {
    Object.assign(summary, await getDashboardSummary());
  } finally {
    loading.value = false;
  }
}
</script>
