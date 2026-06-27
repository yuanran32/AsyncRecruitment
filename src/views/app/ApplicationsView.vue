<template>
  <div class="page">
    <PageHeader title="我的报名" description="报名期可新增、编辑和撤回未分组申请。">
      <template #actions>
        <el-button type="primary" :disabled="!metaStore.isRegistration">新增申请</el-button>
      </template>
    </PageHeader>

    <el-alert v-if="!metaStore.isRegistration" type="warning" :closable="false" show-icon>
      当前不是报名期，只能查看历史申请。
    </el-alert>

    <div class="page-section">
      <el-table v-loading="loading" :data="applications" empty-text="暂无报名申请">
        <el-table-column prop="realName" label="姓名" min-width="110" />
        <el-table-column prop="college" label="学院" min-width="160" />
        <el-table-column prop="major" label="专业" min-width="160" />
        <el-table-column prop="admissionYear" label="入学年份" width="110" />
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <StatusTag :value="row.status" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" @click="$router.push(`/app/applications/${row.id}`)">详情</el-button>
            <el-button text :disabled="!metaStore.isRegistration || row.status !== 'SUBMITTED'">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { getApplications } from '@/api/applications';
import PageHeader from '@/components/common/PageHeader.vue';
import StatusTag from '@/components/common/StatusTag.vue';
import { useMetaStore } from '@/stores/meta';
import type { Application } from '@/types/api';

const metaStore = useMetaStore();
const applications = ref<Application[]>([]);
const loading = ref(false);

onMounted(loadApplications);

async function loadApplications() {
  loading.value = true;
  try {
    applications.value = await getApplications();
  } finally {
    loading.value = false;
  }
}
</script>
