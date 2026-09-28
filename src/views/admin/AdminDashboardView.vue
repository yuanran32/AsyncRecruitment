<template>
  <div class="page dashboard-page">
    <PageHeader
      title="仪表盘"
      description="查看招新进度、报名分布与待处理事项，让管理动作更快落到关键数据上。"
    />

    <section class="dashboard-layout">
      <div class="dashboard-main">
        <div class="kpi-grid" v-loading="loading">
          <article class="kpi-card">
            <span class="muted">注册用户</span>
            <strong>{{ summary.totalUsers }}</strong>
            <small>系统累计注册用户</small>
          </article>
          <article class="kpi-card accent">
            <span class="muted">报名申请</span>
            <strong>{{ summary.totalApplications }}</strong>
            <small>当前周期报名总量</small>
          </article>
          <article class="kpi-card">
            <span class="muted">已分组申请</span>
            <strong>{{ summary.groupedApplications }}</strong>
            <small>已进入分组流程</small>
          </article>
          <article class="kpi-card">
            <span class="muted">未分组申请</span>
            <strong>{{ summary.ungroupedApplications }}</strong>
            <small>待分配到分组</small>
          </article>
          <article class="kpi-card">
            <span class="muted">分组数量</span>
            <strong>{{ summary.totalGroups }}</strong>
            <small>当前可管理分组</small>
          </article>
          <article class="kpi-card">
            <span class="muted">任务数量</span>
            <strong>{{ summary.totalTasks }}</strong>
            <small>已发布组级任务</small>
          </article>
          <article class="kpi-card">
            <span class="muted">已提交结果</span>
            <strong>{{ summary.totalSubmittedTaskResults }}</strong>
            <small>待批阅的任务提交</small>
          </article>
          <article class="kpi-card">
            <span class="muted">已批阅结果</span>
            <strong>{{ summary.totalReviewedTaskResults }}</strong>
            <small>完成评测的任务提交</small>
          </article>
        </div>

        <div class="content-grid">
          <section class="panel chart-panel">
            <div class="panel-head">
              <div class="panel-head-copy">
                <div class="panel-head-title">
                  <h2>报名处理概览</h2>
                  <el-tag effect="plain">本期概览</el-tag>
                </div>
                <p>将已分组与待处理状态放在同一个视野里，方便快速分流。</p>
              </div>
            </div>

            <div class="chart-layout">
              <div ref="chartRef" class="chart"></div>
              <div class="chart-legend">
                <div class="legend-item">
                  <span class="legend-dot primary"></span>
                  <div>
                    <strong>已分组</strong>
                    <p>{{ summary.groupedApplications }} 条</p>
                  </div>
                </div>
                <div class="legend-item">
                  <span class="legend-dot accent"></span>
                  <div>
                    <strong>待处理</strong>
                    <p>{{ summary.ungroupedApplications }} 条</p>
                  </div>
                </div>
                <div class="legend-item">
                  <span class="legend-dot muted"></span>
                  <div>
                    <strong>负责人</strong>
                    <p>{{ summary.leaderCount }} 位</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section class="panel">
            <div class="panel-head">
              <div class="panel-head-copy">
                <h2>系统节奏</h2>
                <p>把关键动作拆成一眼可见的管理节奏。</p>
              </div>
            </div>

            <div class="status-stack">
              <div class="status-row">
                <div class="status-row-head">
                  <div>
                    <strong>未分配申请</strong>
                    <p class="muted">需要优先处理的报名</p>
                  </div>
                  <span class="status-value">{{ pendingRate }}%</span>
                </div>
                <el-progress :percentage="pendingRate" :stroke-width="10" :show-text="false" />
              </div>
              <div class="status-row">
                <div class="status-row-head">
                  <div>
                    <strong>任务完成率</strong>
                    <p class="muted">提交到批阅的整体进度</p>
                  </div>
                  <span class="status-value">{{ taskCompletionPercent }}%</span>
                </div>
                <el-progress :percentage="taskCompletionPercent" :stroke-width="10" :show-text="false" />
              </div>
              <div class="status-row">
                <div class="status-row-head">
                  <div>
                    <strong>已分组覆盖</strong>
                    <p class="muted">报名中进入分组的比例</p>
                  </div>
                  <span class="status-value">{{ groupedRate }}%</span>
                </div>
                <el-progress :percentage="groupedRate" :stroke-width="10" :show-text="false" />
              </div>
            </div>
          </section>
        </div>

        <section class="panel">
          <div class="panel-head">
            <div class="panel-head-copy">
              <h2>分组看板</h2>
              <p>展示每个分组的成员、任务和完成情况。</p>
            </div>
          </div>
          <PageTable :data="groupSummaries" :loading="groupsLoading" empty-text="暂无分组数据">
            <el-table-column prop="groupId" label="分组 ID" width="100" />
            <el-table-column prop="groupName" label="分组名称" min-width="160" />
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
      </div>

      <aside class="dashboard-rail">
        <section class="panel rail-card">
          <div class="panel-head">
            <div class="panel-head-copy">
              <h2>快速操作</h2>
              <p>最常用的管理路径集中在这里。</p>
            </div>
          </div>

          <div class="action-list">
            <el-button type="primary" class="action-btn" @click="go('/admin/applications')">查看报名</el-button>
            <el-button class="action-btn" @click="go('/admin/groups')">处理分组</el-button>
            <el-button class="action-btn" @click="go('/admin/tasks')">管理任务</el-button>
            <el-button class="action-btn" @click="go('/admin/exports')">导出数据</el-button>
          </div>
        </section>

        <section class="panel rail-card">
          <div class="panel-head">
            <div class="panel-head-copy">
              <h2>关键指标</h2>
              <p>用更紧凑的模块呈现需要盯住的数字。</p>
            </div>
          </div>

          <div class="mini-metrics">
            <div>
              <span>已分组申请</span>
              <strong>{{ summary.groupedApplications }}</strong>
            </div>
            <div>
              <span>负责人数量</span>
              <strong>{{ summary.leaderCount }}</strong>
            </div>
            <div>
              <span>未分组申请</span>
              <strong>{{ summary.ungroupedApplications }}</strong>
            </div>
            <div>
              <span>任务提交合计</span>
              <strong>{{ summary.totalSubmittedTaskResults + summary.totalReviewedTaskResults }}</strong>
            </div>
          </div>
        </section>
      </aside>
    </section>

    <el-drawer v-model="detailVisible" title="分组看板详情" size="720px">
      <div v-loading="detailLoading">
        <template v-if="groupDetail">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="分组 ID">{{ groupDetail.groupId }}</el-descriptions-item>
            <el-descriptions-item label="分组名称">{{ groupDetail.groupName }}</el-descriptions-item>
            <el-descriptions-item label="成员数">{{ groupDetail.memberCount }}</el-descriptions-item>
            <el-descriptions-item label="任务数">{{ groupDetail.taskCount }}</el-descriptions-item>
            <el-descriptions-item label="已提交">{{ groupDetail.submittedCount }}</el-descriptions-item>
            <el-descriptions-item label="已批阅">{{ groupDetail.reviewedCount }}</el-descriptions-item>
            <el-descriptions-item label="待提交">{{ groupDetail.pendingCount }}</el-descriptions-item>
            <el-descriptions-item label="完成率">{{ formatPercent(groupDetail.completionRate) }}</el-descriptions-item>
          </el-descriptions>
          <h3 class="detail-title">任务明细</h3>
          <PageTable :data="groupDetail.tasks" empty-text="暂无任务">
            <el-table-column prop="id" label="任务 ID" width="90" />
            <el-table-column prop="title" label="标题" min-width="160" />
            <el-table-column prop="groupId" label="分组 ID" width="90" />
            <el-table-column prop="groupName" label="分组" min-width="140" />
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
        <el-empty v-else description="暂无分组详情" />
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import * as echarts from "echarts";
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";

import { getAdminDashboardGroupDetail, getAdminDashboardGroups, getDashboardSummary } from "@/api/admin";
import PageHeader from "@/components/common/PageHeader.vue";
import PageTable from "@/components/common/PageTable.vue";
import type { AdminDashboardSummary, GroupDashboardDetail, GroupDashboardSummary } from "@/types/api";
import { formatBytes, formatDateTime, formatPercent } from "@/utils/format";

const router = useRouter();
const loading = ref(false);
const groupsLoading = ref(false);
const detailLoading = ref(false);
const detailVisible = ref(false);
const chartRef = ref<HTMLDivElement | null>(null);
let chart: echarts.ECharts | null = null;
const groupSummaries = ref<GroupDashboardSummary[]>([]);
const groupDetail = ref<GroupDashboardDetail | null>(null);

const summary = reactive<AdminDashboardSummary>({
  totalUsers: 0,
  totalApplications: 0,
  groupedApplications: 0,
  ungroupedApplications: 0,
  totalGroups: 0,
  totalTasks: 0,
  totalSubmittedTaskResults: 0,
  totalReviewedTaskResults: 0,
  leaderCount: 0
});

const taskCompletionPercent = computed(() => {
  const total = summary.totalSubmittedTaskResults + summary.totalReviewedTaskResults;
  if (!total) return 0;
  return Math.round((summary.totalReviewedTaskResults / total) * 100);
});
const pendingRate = computed(() => {
  if (!summary.totalApplications) return 0;
  return Math.round((summary.ungroupedApplications / summary.totalApplications) * 100);
});
const groupedRate = computed(() => {
  if (!summary.totalApplications) return 0;
  return Math.round((summary.groupedApplications / summary.totalApplications) * 100);
});

onMounted(async () => {
  await Promise.all([loadSummary(), loadGroups()]);
  initChart();
  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  chart?.dispose();
  chart = null;
});

watch(
  () => [summary.groupedApplications, summary.ungroupedApplications, summary.totalApplications],
  () => {
    renderChart();
  }
);

async function loadSummary() {
  loading.value = true;
  try {
    Object.assign(summary, await getDashboardSummary());
  } finally {
    loading.value = false;
  }
}

async function loadGroups() {
  groupsLoading.value = true;
  try {
    groupSummaries.value = await getAdminDashboardGroups();
  } finally {
    groupsLoading.value = false;
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
    groupDetail.value = await getAdminDashboardGroupDetail(groupId);
  } finally {
    detailLoading.value = false;
  }
}

function initChart() {
  if (!chartRef.value) return;
  chart = echarts.init(chartRef.value);
  renderChart();
}

function renderChart() {
  if (!chart) return;
  const pending = Math.max(summary.ungroupedApplications, 0);
  const grouped = Math.max(summary.groupedApplications, 0);

  chart.setOption({
    animationDuration: 700,
    color: ["#a59bd4", "#c6b38d"],
    tooltip: {
      trigger: "item",
      borderWidth: 0,
      backgroundColor: "rgba(251, 248, 242, 0.96)",
      textStyle: { color: "#2f2b26" }
    },
    series: [
      {
        name: "报名处理",
        type: "pie",
        radius: ["62%", "82%"],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 12,
          borderColor: "#fbf8f2",
          borderWidth: 4
        },
        label: { show: false },
        labelLine: { show: false },
        data: [
          { value: grouped, name: "已分组" },
          { value: pending, name: "待处理" }
        ]
      }
    ],
    graphic: {
      type: "text",
      left: "center",
      top: "center",
      style: {
        text: `${summary.totalApplications}\n报名总量`,
        textAlign: "center",
        fill: "#2f2b26",
        fontSize: 18,
        fontWeight: 700,
        lineHeight: 24
      }
    }
  });
}

function handleResize() {
  chart?.resize();
}

function go(path: string) {
  void router.push(path);
}
</script>

<style scoped>
.dashboard-page {
  gap: 20px;
  min-width: 0;
  container-type: inline-size;
  container-name: dashboard;
}

.dashboard-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 316px;
  gap: 18px;
  align-items: start;
}

.dashboard-main {
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-width: 0;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.kpi-card {
  min-width: 0;
  padding: 18px;
  border: 1px solid rgba(126, 114, 97, 0.1);
  border-radius: 16px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(244, 238, 229, 0.84)),
    var(--app-surface-strong);
  box-shadow:
    10px 10px 22px rgba(145, 128, 106, 0.1),
    -8px -8px 18px rgba(255, 255, 255, 0.82);
}

.kpi-card.accent {
  background:
    linear-gradient(180deg, rgba(165, 155, 212, 0.16), rgba(255, 255, 255, 0.92)),
    var(--app-surface-strong);
}

.kpi-card strong {
  display: block;
  margin-top: 10px;
  color: var(--app-text);
  font-size: 28px;
  line-height: 1;
}

.kpi-card span,
.kpi-card small {
  overflow-wrap: break-word;
  word-break: normal;
  line-break: auto;
  text-wrap: pretty;
}

.kpi-card small {
  display: block;
  margin-top: 10px;
  color: var(--app-muted);
  line-height: 1.5;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.65fr) minmax(0, 1fr);
  gap: 18px;
}

.panel {
  min-width: 0;
  padding: 20px;
  border: 1px solid rgba(126, 114, 97, 0.1);
  border-radius: 16px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(246, 240, 230, 0.88)),
    var(--app-surface-strong);
  box-shadow: var(--app-shadow-soft);
}

.panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.panel-head-copy {
  min-width: 0;
  flex: 1 1 auto;
}

.panel-head-title {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 12px;
}

.panel-head h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  overflow-wrap: break-word;
  text-wrap: pretty;
}

.panel-head p {
  margin: 6px 0 0;
  color: var(--app-muted);
  line-height: 1.55;
  overflow-wrap: break-word;
  word-break: normal;
  line-break: auto;
  text-wrap: pretty;
}

.chart-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 200px;
  gap: 18px;
  align-items: center;
}

.chart {
  width: 100%;
  min-height: 300px;
}

.chart-legend {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  flex: none;
}

.legend-dot.primary {
  background: var(--app-primary);
}

.legend-dot.accent {
  background: var(--app-accent);
}

.legend-dot.muted {
  background: #c0c6bf;
}

.legend-item strong {
  display: block;
  font-size: 14px;
}

.legend-item p {
  margin: 4px 0 0;
  color: var(--app-muted);
}

.status-stack {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.status-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 10px;
  min-width: 0;
}

.status-row-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.status-row-head > div {
  min-width: 0;
  flex: 1 1 auto;
}

.status-row strong {
  display: block;
  overflow-wrap: break-word;
  text-wrap: pretty;
}

.status-row p {
  margin: 6px 0 0;
  line-height: 1.5;
  overflow-wrap: break-word;
  word-break: normal;
  text-wrap: pretty;
}

.status-value {
  flex: none;
  color: var(--app-text);
  font-size: 16px;
  font-weight: 700;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
}

.status-row :deep(.el-progress) {
  width: 100%;
  min-width: 0;
}

.status-row :deep(.el-progress-bar) {
  min-width: 0;
  padding-right: 0;
}

.dashboard-rail {
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-width: 0;
}

.rail-card {
  position: sticky;
  top: 18px;
}

.action-list {
  display: grid;
  gap: 10px;
}

.action-btn {
  width: 100%;
  justify-content: flex-start;
}

.mini-metrics {
  display: grid;
  gap: 14px;
}

.mini-metrics div {
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(247, 242, 234, 0.8);
}

.mini-metrics span {
  display: block;
  color: var(--app-muted);
  font-size: 13px;
}

.mini-metrics strong {
  display: block;
  margin-top: 10px;
  font-size: 24px;
  color: var(--app-text);
}

@media (max-width: 1440px) {
  .dashboard-layout {
    grid-template-columns: 1fr;
  }

  .rail-card {
    position: static;
  }
}

@media (max-width: 1100px) {
  .content-grid,
  .chart-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 1024px) {
  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .kpi-grid {
    grid-template-columns: 1fr;
  }
}

@container dashboard (max-width: 1180px) {
  .dashboard-layout {
    grid-template-columns: 1fr;
  }

  .rail-card {
    position: static;
  }
}

@container dashboard (max-width: 840px) {
  .content-grid,
  .chart-layout {
    grid-template-columns: 1fr;
  }

  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@container dashboard (max-width: 520px) {
  .kpi-grid {
    grid-template-columns: 1fr;
  }
}

.detail-title {
  margin: 18px 0 10px;
  font-size: 16px;
}
</style>

