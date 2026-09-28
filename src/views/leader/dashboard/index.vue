<template>
  <div class="page">
    <PageHeader title="负责人工作台" description="汇总责任包成员、任务提交和完成情况。" />

    <section class="metric-grid">
      <div class="metric-card">
        <span class="muted">责任包</span>
        <strong>{{ groups.length }}</strong>
      </div>
      <div class="metric-card">
        <span class="muted">组员</span>
        <strong>{{ totals.memberCount }}</strong>
      </div>
      <div class="metric-card">
        <span class="muted">任务</span>
        <strong>{{ totals.taskCount }}</strong>
      </div>
      <div class="metric-card">
        <span class="muted">已提交</span>
        <strong>{{ totals.submittedCount }}</strong>
      </div>
      <div class="metric-card">
        <span class="muted">已批阅</span>
        <strong>{{ totals.reviewedCount }}</strong>
      </div>
      <div class="metric-card">
        <span class="muted">待提交</span>
        <strong>{{ totals.pendingCount }}</strong>
      </div>
    </section>

    <section class="page-section">
      <div class="page-toolbar">
        <h3>责任包看板</h3>
        <el-button :icon="Refresh" :loading="loading" @click="loadData">刷新</el-button>
      </div>
      <PageTable :data="groups" :loading="loading" empty-text="暂无责任包数据">
        <el-table-column prop="groupName" label="责任包" min-width="160" />
        <el-table-column prop="memberCount" label="成员" width="90" />
        <el-table-column prop="taskCount" label="任务" width="90" />
        <el-table-column prop="submittedCount" label="已提交" width="90" />
        <el-table-column prop="reviewedCount" label="已批阅" width="90" />
        <el-table-column prop="pendingCount" label="待提交" width="90" />
        <el-table-column label="完成率" width="110">
          <template #default="{ row }">{{ formatPercent(row.completionRate) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="110" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" @click="openGroupDetail(row.groupId)">详情</el-button>
          </template>
        </el-table-column>
      </PageTable>
    </section>

    <el-drawer v-model="detailVisible" title="责任包详情" size="760px">
      <div v-loading="detailLoading">
        <template v-if="groupDetail">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="责任包">{{ groupDetail.groupName }}</el-descriptions-item>
            <el-descriptions-item label="成员数">{{ groupDetail.memberCount }}</el-descriptions-item>
            <el-descriptions-item label="任务数">{{ groupDetail.taskCount }}</el-descriptions-item>
            <el-descriptions-item label="已提交">{{ groupDetail.submittedCount }}</el-descriptions-item>
            <el-descriptions-item label="已批阅">{{ groupDetail.reviewedCount }}</el-descriptions-item>
            <el-descriptions-item label="待提交">{{ groupDetail.pendingCount }}</el-descriptions-item>
            <el-descriptions-item label="完成率">{{ formatPercent(groupDetail.completionRate) }}</el-descriptions-item>
          </el-descriptions>
          <h3 class="detail-title">任务明细</h3>
          <PageTable :data="groupDetail.tasks" empty-text="暂无任务">
            <el-table-column prop="title" label="标题" min-width="160" />
            <el-table-column prop="groupName" label="责任包" min-width="140" />
            <el-table-column label="附件" min-width="180" show-overflow-tooltip>
              <template #default="{ row }">{{ formatAttachment(row.attachment) }}</template>
            </el-table-column>
            <el-table-column prop="maxScore" label="满分" width="80" />
            <el-table-column prop="memberCount" label="成员" width="80" />
            <el-table-column prop="pendingCount" label="待提交" width="90" />
            <el-table-column prop="submittedCount" label="已提交" width="90" />
            <el-table-column prop="reviewedCount" label="已批阅" width="90" />
            <el-table-column label="完成率" width="100">
              <template #default="{ row }">{{ formatPercent(row.completionRate) }}</template>
            </el-table-column>
            <el-table-column label="截止时间" min-width="160">
              <template #default="{ row }">{{ formatDateTime(row.deadlineAt) }}</template>
            </el-table-column>
            <el-table-column label="创建时间" min-width="160">
              <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
            </el-table-column>
            <el-table-column label="更新时间" min-width="160">
              <template #default="{ row }">{{ formatDateTime(row.updatedAt) }}</template>
            </el-table-column>
          </PageTable>
        </template>
        <el-empty v-else description="暂无责任包详情" />
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { Refresh } from '@element-plus/icons-vue';
import { computed, onMounted, ref } from 'vue';

import { getLeaderDashboardGroupDetail, getLeaderDashboardGroups } from '@/api/leader';
import PageHeader from '@/components/common/PageHeader.vue';
import PageTable from '@/components/common/PageTable.vue';
import type { GroupDashboardDetail, GroupDashboardSummary } from '@/types/api';
import { formatBytes, formatDateTime, formatPercent } from '@/utils/format';

const loading = ref(false);
const detailLoading = ref(false);
const detailVisible = ref(false);
const groups = ref<GroupDashboardSummary[]>([]);
const groupDetail = ref<GroupDashboardDetail | null>(null);
const totals = computed(() =>
  groups.value.reduce(
    (acc, item) => ({
      memberCount: acc.memberCount + item.memberCount,
      taskCount: acc.taskCount + item.taskCount,
      submittedCount: acc.submittedCount + item.submittedCount,
      reviewedCount: acc.reviewedCount + item.reviewedCount,
      pendingCount: acc.pendingCount + item.pendingCount
    }),
    { memberCount: 0, taskCount: 0, submittedCount: 0, reviewedCount: 0, pendingCount: 0 }
  )
);

onMounted(loadData);

async function loadData() {
  loading.value = true;
  try {
    groups.value = await getLeaderDashboardGroups();
  } finally {
    loading.value = false;
  }
}

function formatAttachment(attachment?: { originalFileName?: string; sizeBytes?: number | null } | null) {
  if (!attachment?.originalFileName) return '—';
  return `${attachment.originalFileName} (${formatBytes(attachment.sizeBytes)})`;
}

async function openGroupDetail(groupId: number) {
  detailVisible.value = true;
  detailLoading.value = true;
  try {
    groupDetail.value = await getLeaderDashboardGroupDetail(groupId);
  } finally {
    detailLoading.value = false;
  }
}
</script>

<style scoped>
.metric-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 18px;
}

.metric-card {
  min-width: 0;
  padding: 16px;
  border-radius: 16px;
  background: var(--app-surface-strong);
  box-shadow: var(--app-shadow-soft);
}

.metric-card strong {
  display: block;
  margin-top: 8px;
  font-size: 24px;
}

.detail-title {
  margin: 18px 0 10px;
  font-size: 16px;
}

@media (max-width: 1100px) {
  .metric-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
