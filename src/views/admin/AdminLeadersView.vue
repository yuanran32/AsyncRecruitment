<template>
  <div class="page">
    <PageHeader title="负责人任命" description="为分组任命或撤销负责人，候选人必须是正常状态的负责人账号。">
      <template #actions>
        <el-button :icon="Refresh" :loading="loading" @click="loadData">刷新</el-button>
      </template>
    </PageHeader>

    <el-alert v-if="!metaStore.isSelection" type="warning" show-icon :closable="false">
      当前不是选拔期，负责人任命操作应由后端时期校验最终拦截。
    </el-alert>

    <section class="page-section">
      <el-table v-loading="loading" :data="groups" empty-text="暂无分组">
        <el-table-column prop="name" label="分组" min-width="180" />
        <el-table-column label="方向" min-width="170">
          <template #default="{ row }">{{ getGroupDirectionLabel(row) }}</template>
        </el-table-column>
        <el-table-column label="年级" width="90">
          <template #default="{ row }">{{ getGradeLabel(row.grade) }}</template>
        </el-table-column>
        <el-table-column prop="admissionYear" label="入学年份" width="110" />
        <el-table-column label="容量" width="110">
          <template #default="{ row }">{{ row.currentSize ?? 0 }} / {{ row.maxSize }}</template>
        </el-table-column>
        <el-table-column label="当前负责人" min-width="150">
          <template #default="{ row }">{{ getLeaderName(row.leaderUserId) }}</template>
        </el-table-column>
        <el-table-column label="候选负责人" min-width="220">
          <template #default="{ row }">
            <el-select v-model="selectedLeaderIds[row.id]" filterable clearable placeholder="选择负责人">
              <el-option v-for="leader in leaders" :key="leader.id" :label="leader.username" :value="leader.id" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" min-width="170">
          <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="更新时间" min-width="170">
          <template #default="{ row }">{{ formatDateTime(row.updatedAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" :width="isMobile ? 84 : 240" fixed="right">
          <template #default="{ row }">
            <div class="table-actions">
              <el-button text type="primary" :icon="Check" :loading="actionGroupId === row.id" @click="handleAssign(row)">
                任命
              </el-button>
              <ConfirmAction title="确认撤销该分组负责人？" @confirm="handleRemove(row)">
                <el-button text type="danger" :icon="Close" :loading="actionGroupId === row.id" :disabled="!row.leaderUserId">
                  撤销
                </el-button>
              </ConfirmAction>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Check, Close, Refresh } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { onMounted, reactive, ref } from 'vue';

import { assignLeader, getAdminGroups, getAdminUsers, removeLeader } from '@/api/admin';
import ConfirmAction from '@/components/common/ConfirmAction.vue';
import PageHeader from '@/components/common/PageHeader.vue';
import { useIsMobile } from '@/composables/useMediaQuery';
import { useMetaStore } from '@/stores/meta';
import type { Grade, Group, User } from '@/types/api';
import { formatDateTime } from '@/utils/format';
import { gradeLabels } from '@/utils/labels';

const isMobile = useIsMobile();
const metaStore = useMetaStore();
const groups = ref<Group[]>([]);
const leaders = ref<User[]>([]);
const loading = ref(false);
const actionGroupId = ref<number | null>(null);
const selectedLeaderIds = reactive<Record<number, number | undefined>>({});

onMounted(loadData);

async function loadData() {
  loading.value = true;
  try {
    const [groupList, leaderPage] = await Promise.all([
      getAdminGroups(),
      getAdminUsers({ role: 'LEADER', status: 'ACTIVE', page: 1, size: 50 })
    ]);
    groups.value = groupList;
    leaders.value = leaderPage.list;
    groupList.forEach((group) => {
      selectedLeaderIds[group.id] = group.leaderUserId || undefined;
    });
  } finally {
    loading.value = false;
  }
}

async function handleAssign(group: Group) {
  const leaderId = selectedLeaderIds[group.id];
  if (!leaderId) {
    ElMessage.warning('请选择负责人');
    return;
  }

  actionGroupId.value = group.id;
  try {
    await assignLeader(group.id, leaderId);
    ElMessage.success('负责人已任命');
    await loadData();
  } finally {
    actionGroupId.value = null;
  }
}

async function handleRemove(group: Group) {
  actionGroupId.value = group.id;
  try {
    await removeLeader(group.id);
    ElMessage.success('负责人已撤销');
    await loadData();
  } finally {
    actionGroupId.value = null;
  }
}

function getLeaderName(userId?: number | null) {
  if (!userId) return '未任命';
  return leaders.value.find((user) => user.id === userId)?.username || `用户 #${userId}`;
}

function getGroupDirectionLabel(group: Group) {
  const level1 = group.directionLevel1Name || findDirectionName(group.directionLevel1Id);
  const level2 = group.directionLevel2Name || findDirectionName(group.directionLevel2Id);
  return [level1, level2].filter(Boolean).join(' / ') || '未知方向';
}

function getGradeLabel(grade: Grade) {
  return gradeLabels[grade] || grade;
}

function findDirectionName(id: number) {
  const direction = metaStore.directions.flatMap((item) => [item, ...(item.children || [])]).find((item) => item.id === id);
  return direction?.name;
}
</script>
