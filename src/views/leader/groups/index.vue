<template>
  <div class="page">
    <PageHeader title="责任包" description="查看本人负责的责任包、容量和方向信息。" />
    <section class="page-section">
      <PageTable :data="groups" :loading="loading">
        <el-table-column prop="id" label="分组 ID" width="90" />
        <el-table-column prop="name" label="责任包" min-width="180" />
        <el-table-column label="方向" min-width="180">
          <template #default="{ row }">{{ getGroupDirectionLabel(row) }}</template>
        </el-table-column>
        <el-table-column prop="directionLevel1Id" label="一级方向 ID" width="120" />
        <el-table-column prop="directionLevel2Id" label="二级方向 ID" width="120" />
        <el-table-column label="年级" width="110">
          <template #default="{ row }">{{ getGradeLabel(row.grade) }}</template>
        </el-table-column>
        <el-table-column prop="admissionYear" label="入学年份" width="110" />
        <el-table-column label="容量" width="110">
          <template #default="{ row }">{{ row.currentSize ?? 0 }} / {{ row.maxSize }}</template>
        </el-table-column>
        <el-table-column prop="leaderUserId" label="负责人 ID" width="110" />
        <el-table-column label="创建时间" min-width="170">
          <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="更新时间" min-width="170">
          <template #default="{ row }">{{ formatDateTime(row.updatedAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <div class="table-actions">
              <el-button text type="primary" @click="openDetail(row)">详情</el-button>
              <el-button text type="primary" @click="$router.push(`/leader/groups/${row.id}/members`)">查看组员</el-button>
            </div>
          </template>
        </el-table-column>
      </PageTable>
    </section>

    <el-drawer v-model="detailVisible" title="责任包详情" size="560px">
      <el-descriptions v-if="detailGroup" :column="2" border>
        <el-descriptions-item label="分组 ID">{{ detailGroup.id }}</el-descriptions-item>
        <el-descriptions-item label="责任包">{{ detailGroup.name }}</el-descriptions-item>
        <el-descriptions-item label="方向">{{ getGroupDirectionLabel(detailGroup) }}</el-descriptions-item>
        <el-descriptions-item label="一级方向 ID">{{ detailGroup.directionLevel1Id }}</el-descriptions-item>
        <el-descriptions-item label="二级方向 ID">{{ detailGroup.directionLevel2Id }}</el-descriptions-item>
        <el-descriptions-item label="年级">{{ getGradeLabel(detailGroup.grade) }}</el-descriptions-item>
        <el-descriptions-item label="入学年份">{{ detailGroup.admissionYear }}</el-descriptions-item>
        <el-descriptions-item label="容量">{{ detailGroup.currentSize ?? 0 }} / {{ detailGroup.maxSize }}</el-descriptions-item>
        <el-descriptions-item label="负责人 ID">{{ detailGroup.leaderUserId ?? '—' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDateTime(detailGroup.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ formatDateTime(detailGroup.updatedAt) }}</el-descriptions-item>
      </el-descriptions>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { getGroups } from '@/api/leader';
import PageHeader from '@/components/common/PageHeader.vue';
import PageTable from '@/components/common/PageTable.vue';
import type { Grade, Group } from '@/types/api';
import { formatDateTime } from '@/utils/format';
import { gradeLabels } from '@/utils/labels';

const loading = ref(false);
const groups = ref<Group[]>([]);
const detailVisible = ref(false);
const detailGroup = ref<Group | null>(null);

onMounted(async () => {
  loading.value = true;
  try {
    groups.value = (await getGroups({ page: 1, size: 100 })).list;
  } finally {
    loading.value = false;
  }
});

function openDetail(group: Group) {
  detailGroup.value = group;
  detailVisible.value = true;
}

function getGroupDirectionLabel(group: Group) {
  const level1 = group.directionLevel1Name;
  const level2 = group.directionLevel2Name;
  return [level1, level2].filter(Boolean).join(' / ') || '未知方向';
}

function getGradeLabel(grade: Grade) {
  return gradeLabels[grade] || grade;
}
</script>
