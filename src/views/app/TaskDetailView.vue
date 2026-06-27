<template>
  <div class="page">
    <PageHeader :title="task?.title || '任务详情'" description="查看任务说明、提交附件并浏览提交历史。" />

    <div class="page-section" v-loading="loading">
      <template v-if="task">
        <div class="task-meta">
          <span>满分：{{ task.maxScore }}</span>
          <span>截止：{{ task.deadlineAt }}</span>
        </div>
        <MarkdownViewer :content="task.content || '暂无任务说明。'" />
      </template>
    </div>

    <div class="page-section">
      <div class="page-toolbar">
        <h2>提交记录</h2>
        <el-button type="primary" :disabled="!canSubmit">提交任务</el-button>
      </div>
      <el-table :data="submissions" empty-text="暂无提交记录">
        <el-table-column prop="submitVersion" label="版本" width="90" />
        <el-table-column prop="submittedAt" label="提交时间" min-width="190" />
        <el-table-column label="当前版本" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.isLatest" type="success">是</el-tag>
            <el-tag v-else type="info">否</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { getMyTaskSubmissions, getTask } from '@/api/tasks';
import PageHeader from '@/components/common/PageHeader.vue';
import MarkdownViewer from '@/components/markdown/MarkdownViewer.vue';
import { useMetaStore } from '@/stores/meta';
import type { Task, TaskSubmission } from '@/types/api';

const route = useRoute();
const metaStore = useMetaStore();
const task = ref<Task | null>(null);
const submissions = ref<TaskSubmission[]>([]);
const loading = ref(false);
const canSubmit = computed(() => metaStore.isSelection && task.value);

onMounted(loadDetail);

async function loadDetail() {
  loading.value = true;
  try {
    const id = String(route.params.id);
    const [taskData, submissionData] = await Promise.all([getTask(id), getMyTaskSubmissions(id)]);
    task.value = taskData;
    submissions.value = submissionData;
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.task-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
  color: var(--app-muted);
}

h2 {
  margin: 0;
  font-size: 18px;
}
</style>
