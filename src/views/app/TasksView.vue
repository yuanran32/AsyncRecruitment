<template>
  <div class="page">
    <PageHeader title="任务" description="查看本人可见任务、提交状态和截止时间。" />
    <div class="page-section">
      <el-table v-loading="loading" :data="tasks" empty-text="暂无任务">
        <el-table-column prop="title" label="任务标题" min-width="220" />
        <el-table-column label="范围" width="100">
          <template #default="{ row }">{{ getScopeLabel(row.scope) }}</template>
        </el-table-column>
        <el-table-column prop="maxScore" label="满分" width="90" />
        <el-table-column prop="deadlineAt" label="截止时间" min-width="190" />
        <el-table-column label="提交状态" width="120">
          <template #default="{ row }">
            <StatusTag :value="row.submissionStatus" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="110" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" @click="$router.push(`/app/tasks/${row.id}`)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { getTasks } from '@/api/tasks';
import PageHeader from '@/components/common/PageHeader.vue';
import StatusTag from '@/components/common/StatusTag.vue';
import type { Scope, Task } from '@/types/api';
import { scopeLabels } from '@/utils/labels';

const tasks = ref<Task[]>([]);
const loading = ref(false);

onMounted(loadTasks);

async function loadTasks() {
  loading.value = true;
  try {
    const page = await getTasks({ page: 1, size: 10 });
    tasks.value = page.list;
  } finally {
    loading.value = false;
  }
}

function getScopeLabel(scope?: Scope) {
  return scope ? scopeLabels[scope] : '未知';
}
</script>
