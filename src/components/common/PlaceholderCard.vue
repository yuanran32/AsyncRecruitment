<template>
  <div class="placeholder-card">
    <el-icon :size="26">
      <Document />
    </el-icon>
    <div>
      <h2>{{ title }}</h2>
      <p>{{ description }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Document } from '@element-plus/icons-vue';

defineProps<{
  title: string;
  description: string;
}>();
</script>

<style scoped>
.placeholder-card {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 20px;
  border: 1px dashed var(--app-border);
  border-radius: 8px;
  background: #fff;
}

h2 {
  margin: 0 0 6px;
  font-size: 16px;
}

p {
  margin: 0;
  color: var(--app-muted);
}
</style>
