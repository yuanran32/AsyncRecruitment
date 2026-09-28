<template>
  <div class="page">
    <PageHeader title="通知中心" description="查看系统通知、审核通知以及公告通知。" />
    <section class="page-section">
      <div class="page-toolbar">
        <div class="toolbar-left">
          <el-checkbox v-model="query.unreadOnly" @change="loadNotifications">只看未读</el-checkbox>
          <el-button :disabled="!notifications.some((item) => !item.readAt)" @click="markAllRead">全部已读</el-button>
        </div>
        <el-button :icon="Refresh" :loading="loading" @click="loadNotifications">刷新</el-button>
      </div>
      <PageTable :data="notifications" :loading="loading">
        <el-table-column prop="title" label="标题" min-width="180" />
        <el-table-column prop="content" label="内容" min-width="240" show-overflow-tooltip />
        <el-table-column label="类型" min-width="120">
          <template #default="{ row }">{{ getTypeLabel(row.type) }}</template>
        </el-table-column>
        <el-table-column prop="relatedType" label="关联类型" min-width="120" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.readAt ? 'info' : 'success'" effect="plain">
              {{ row.readAt ? '已读' : '未读' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" min-width="170">
          <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="更新时间" min-width="170">
          <template #default="{ row }">{{ formatDateTime(row.updatedAt) }}</template>
        </el-table-column>
        <el-table-column label="已读时间" min-width="170">
          <template #default="{ row }">{{ formatDateTime(row.readAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" :width="isMobile ? 96 : 180" fixed="right">
          <template #default="{ row }">
            <div class="table-actions">
              <el-button text type="primary" @click="openDetail(row)">详情</el-button>
              <el-button text type="primary" :icon="Check" :disabled="Boolean(row.readAt)" @click="markRead(row.id)">
                标为已读
              </el-button>
            </div>
          </template>
        </el-table-column>
      </PageTable>
    </section>

    <el-drawer v-model="detailVisible" title="通知详情" :size="isMobile ? '100%' : '560px'">
      <el-descriptions v-if="detailItem" :column="1" border>
        <el-descriptions-item label="标题">{{ displayText(detailItem.title) }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ getTypeLabel(detailItem.type) }}</el-descriptions-item>
        <el-descriptions-item label="关联类型">{{ displayText(detailItem.relatedType) }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ detailItem.readAt ? '已读' : '未读' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDateTime(detailItem.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ formatDateTime(detailItem.updatedAt) }}</el-descriptions-item>
        <el-descriptions-item label="已读时间">{{ formatDateTime(detailItem.readAt) }}</el-descriptions-item>
        <el-descriptions-item label="内容">
          <div class="notify-content">{{ displayText(detailItem.content) }}</div>
        </el-descriptions-item>
      </el-descriptions>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { Check, Refresh } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { onMounted, reactive, ref } from 'vue';

import { getCurrentNotifications, markAllNotificationsRead, markNotificationRead } from '@/api/admin';
import PageHeader from '@/components/common/PageHeader.vue';
import PageTable from '@/components/common/PageTable.vue';
import { useIsMobile } from '@/composables/useMediaQuery';
import type { NotificationItem, NotificationType } from '@/types/api';
import { displayText, formatDateTime } from '@/utils/format';
import { notificationTypeLabels } from '@/utils/labels';

const isMobile = useIsMobile();
const loading = ref(false);
const notifications = ref<NotificationItem[]>([]);
const detailVisible = ref(false);
const detailItem = ref<NotificationItem | null>(null);
const query = reactive({ unreadOnly: false, page: 1, size: 10 });

onMounted(loadNotifications);

async function loadNotifications() {
  loading.value = true;
  try {
    notifications.value = (await getCurrentNotifications(query)).list;
  } finally {
    loading.value = false;
  }
}

async function markRead(id: number) {
  await markNotificationRead(id);
  ElMessage.success('通知已标为已读');
  await loadNotifications();
}

async function markAllRead() {
  await markAllNotificationsRead();
  ElMessage.success('全部通知已标为已读');
  await loadNotifications();
}

function openDetail(item: NotificationItem) {
  detailItem.value = item;
  detailVisible.value = true;
}

function getTypeLabel(type?: string) {
  if (!type) return '—';
  return notificationTypeLabels[type as NotificationType] || type;
}
</script>

<style scoped>
.toolbar-left {
  display: flex;
  align-items: center;
  flex: 1;
  gap: 10px;
}

.notify-content {
  white-space: pre-wrap;
  line-height: 1.7;
}
</style>
