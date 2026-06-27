<template>
  <div class="page">
    <PageHeader title="首页" description="查看当前招新阶段、报名状态、分组和任务概览。" />

    <div class="metric-grid">
      <div class="metric-card">
        <span class="muted">当前时期</span>
        <strong>{{ currentPeriodLabel }}</strong>
      </div>
      <div class="metric-card">
        <span class="muted">我的角色</span>
        <strong>{{ roleLabel }}</strong>
      </div>
      <div class="metric-card">
        <span class="muted">所在分组</span>
        <strong>{{ authStore.user?.groups?.length || 0 }}</strong>
      </div>
    </div>

    <div class="page-section">
      <h2>快捷入口</h2>
      <el-space wrap>
        <el-button type="primary" @click="$router.push('/app/applications')">我的报名</el-button>
        <el-button @click="$router.push('/app/tasks')">查看任务</el-button>
        <el-button @click="$router.push('/app/announcements')">公告通知</el-button>
        <el-button @click="$router.push('/app/materials')">学习资料</el-button>
      </el-space>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import PageHeader from '@/components/common/PageHeader.vue';
import { useAuthStore } from '@/stores/auth';
import { useMetaStore } from '@/stores/meta';
import { periodLabels, roleLabels } from '@/utils/labels';

const authStore = useAuthStore();
const metaStore = useMetaStore();

const currentPeriodLabel = computed(() => (metaStore.period ? periodLabels[metaStore.period] : '未知'));
const roleLabel = computed(() => (authStore.user?.role ? roleLabels[authStore.user.role] : '未知'));
</script>

<style scoped>
h2 {
  margin: 0 0 12px;
  font-size: 18px;
}
</style>
