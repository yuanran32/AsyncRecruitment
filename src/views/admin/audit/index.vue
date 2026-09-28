<template>
  <div class="page">
    <PageHeader title="审计日志" description="查看管理员和负责人关键业务操作记录。" />
    <section class="page-section audit-section">
      <div class="page-toolbar audit-toolbar">
        <div class="toolbar-left">
          <el-select v-model="query.module" class="module-select" clearable placeholder="全部模块">
            <el-option v-for="item in moduleOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-select v-model="query.severity" class="module-select" clearable placeholder="全部级别">
            <el-option v-for="item in severityOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-select v-model="query.success" class="module-select" clearable placeholder="全部结果">
            <el-option label="成功" :value="true" />
            <el-option label="失败" :value="false" />
          </el-select>
          <el-input v-model="query.keyword" class="keyword-input" clearable placeholder="搜索操作人、动作、摘要、对象、路径或 IP" @keyup.enter="loadLogs" />
        </div>
        <el-button :icon="Refresh" :loading="loading" @click="loadLogs">刷新</el-button>
      </div>
      <div class="audit-table-shell">
        <div class="audit-table-scroll">
          <PageTable
            class="audit-table"
            v-model:page="query.page"
            v-model:size="query.size"
            :data="logs"
            :loading="loading"
            :total="total"
            pagination
            table-layout="fixed"
            @update:page="loadLogs"
            @update:size="handleSizeChange"
          >
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="actorUsername" label="操作人" min-width="120" />
            <el-table-column label="角色" width="100">
              <template #default="{ row }">{{ getRoleLabel(row.actorRole) }}</template>
            </el-table-column>
            <el-table-column label="模块" width="110">
              <template #default="{ row }">{{ getModuleLabel(row.module) }}</template>
            </el-table-column>
            <el-table-column prop="action" label="动作" min-width="120" />
            <el-table-column label="级别" width="100">
              <template #default="{ row }">{{ getSeverityLabel(row.severity) }}</template>
            </el-table-column>
            <el-table-column label="结果" width="90">
              <template #default="{ row }">
                <el-tag :type="row.success === false ? 'danger' : 'success'" effect="plain">
                  {{ row.success === false ? '失败' : '成功' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="对象" min-width="150" class-name="audit-wrap-col">
              <template #default="{ row }">{{ formatTarget(row) }}</template>
            </el-table-column>
            <el-table-column prop="summary" label="摘要" min-width="180" class-name="audit-wrap-col" show-overflow-tooltip />
            <el-table-column prop="clientIp" label="IP" min-width="130" />
            <el-table-column label="时间" min-width="170">
              <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
            </el-table-column>
            <el-table-column label="操作" width="90" fixed="right">
              <template #default="{ row }">
                <el-button text type="primary" @click="openDetail(row)">详情</el-button>
              </template>
            </el-table-column>
          </PageTable>
        </div>
      </div>
    </section>

    <el-drawer v-model="detailVisible" title="审计详情" size="640px">
      <el-descriptions v-if="detailLog" :column="1" border>
        <el-descriptions-item label="ID">{{ displayText(detailLog.id) }}</el-descriptions-item>
        <el-descriptions-item label="操作人 ID">{{ displayText(detailLog.actorUserId) }}</el-descriptions-item>
        <el-descriptions-item label="操作人">{{ displayText(detailLog.actorUsername) }}</el-descriptions-item>
        <el-descriptions-item label="角色">{{ getRoleLabel(detailLog.actorRole) }}</el-descriptions-item>
        <el-descriptions-item label="模块">{{ getModuleLabel(detailLog.module) }}</el-descriptions-item>
        <el-descriptions-item label="动作">{{ displayText(detailLog.action) }}</el-descriptions-item>
        <el-descriptions-item label="级别">{{ getSeverityLabel(detailLog.severity) }}</el-descriptions-item>
        <el-descriptions-item label="结果">{{ detailLog.success === false ? '失败' : '成功' }}</el-descriptions-item>
        <el-descriptions-item label="目标类型">{{ displayText(detailLog.targetType) }}</el-descriptions-item>
        <el-descriptions-item label="目标 ID">{{ displayText(detailLog.targetId) }}</el-descriptions-item>
        <el-descriptions-item label="摘要">{{ displayText(detailLog.summary) }}</el-descriptions-item>
        <el-descriptions-item label="请求 ID">{{ displayText(detailLog.requestId) }}</el-descriptions-item>
        <el-descriptions-item label="请求路径">{{ displayText(detailLog.requestPath) }}</el-descriptions-item>
        <el-descriptions-item label="IP">{{ displayText(detailLog.clientIp) }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDateTime(detailLog.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="JSON">
          <pre class="json-block">{{ formatDetailJson(detailLog.detailJson) }}</pre>
        </el-descriptions-item>
      </el-descriptions>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { Refresh } from '@element-plus/icons-vue';
import { onMounted, reactive, ref } from 'vue';

import { getAdminAuditLogs } from '@/api/admin';
import PageHeader from '@/components/common/PageHeader.vue';
import PageTable from '@/components/common/PageTable.vue';
import type { AuditLog, AuditModule, AuditSeverity, Role } from '@/types/api';
import { displayText, formatDateTime } from '@/utils/format';
import { auditModuleLabels, auditSeverityLabels, roleLabels } from '@/utils/labels';

const moduleOptions = Object.entries(auditModuleLabels).map(([value, label]) => ({ value: value as AuditModule, label }));
const severityOptions = Object.entries(auditSeverityLabels).map(([value, label]) => ({ value: value as AuditSeverity, label }));
const loading = ref(false);
const logs = ref<AuditLog[]>([]);
const total = ref(0);
const detailVisible = ref(false);
const detailLog = ref<AuditLog | null>(null);
const query = reactive({
  module: '' as AuditModule | '',
  severity: '' as AuditSeverity | '',
  success: undefined as boolean | undefined,
  keyword: '',
  page: 1,
  size: 10
});


onMounted(loadLogs);

async function loadLogs() {
  loading.value = true;
  try {
    const result = await getAdminAuditLogs({
      module: query.module || undefined,
      severity: query.severity || undefined,
      success: query.success,
      keyword: query.keyword || undefined,
      page: query.page,
      size: query.size
    });
    logs.value = result.list;
    total.value = result.total;
  } finally {
    loading.value = false;
  }
}

function handleSizeChange() {
  query.page = 1;
  void loadLogs();
}

function openDetail(row: AuditLog) {
  detailLog.value = row;
  detailVisible.value = true;
}

function getModuleLabel(module?: AuditLog['module']) {
  return module ? auditModuleLabels[module as AuditModule] || module : '—';
}

function getSeverityLabel(severity?: AuditLog['severity']) {
  return severity ? auditSeverityLabels[severity as AuditSeverity] || severity : '—';
}

function getRoleLabel(role?: Role | null) {
  return role ? roleLabels[role] || role : '—';
}

function formatTarget(row: AuditLog) {
  const type = row.targetType || '';
  const id = row.targetId != null ? `#${row.targetId}` : '';
  return [type, id].filter(Boolean).join(' ') || '—';
}

function formatDetailJson(value?: string | null) {
  if (!value) return '—';
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}
</script>

<style scoped>
.audit-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.audit-toolbar,
.toolbar-left {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.toolbar-left {
  flex: 1;
}

.audit-toolbar {
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(126, 114, 97, 0.1);
}

.audit-table-shell,
.audit-table-scroll {
  max-width: 100%;
  min-width: 0;
}

.audit-table-shell {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.audit-table-scroll {
  overflow-x: auto;
  padding-bottom: 2px;
  -webkit-overflow-scrolling: touch;
}

.audit-table {
  min-width: 1100px;
}

.audit-table :deep(.el-table) {
  width: 100%;
  table-layout: fixed;
}

.audit-table :deep(.el-table__header-wrapper th .cell),
.audit-table :deep(.el-table__body td .cell) {
  padding: 8px 12px;
  text-align: left;
  vertical-align: middle;
}

.audit-table :deep(.el-table__header-wrapper th .cell) {
  min-height: 22px;
}

.audit-table :deep(.audit-wrap-col .cell) {
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-word;
  line-height: 1.45;
}

.audit-table :deep(.audit-wrap-col) {
  vertical-align: middle;
}

.json-block {
  margin: 0;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
  line-height: 1.5;
}

.module-select {
  width: 160px;
}

.keyword-input {
  width: 260px;
}

@media (max-width: 960px) {
  .audit-toolbar {
    align-items: stretch;
  }

  .toolbar-left,
  .module-select,
  .keyword-input,
  .audit-toolbar > :deep(.el-button) {
    width: 100%;
  }
}
</style>
