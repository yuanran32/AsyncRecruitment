<template>
  <el-descriptions :column="column" border>
    <el-descriptions-item label="申请 ID">{{ displayText(application.id) }}</el-descriptions-item>
    <el-descriptions-item label="用户 ID">{{ displayText(application.userId) }}</el-descriptions-item>
    <el-descriptions-item label="用户名">{{ displayText(application.username) }}</el-descriptions-item>
    <el-descriptions-item label="邮箱">{{ displayText(application.email) }}</el-descriptions-item>
    <el-descriptions-item label="姓名">{{ displayText(application.realName) }}</el-descriptions-item>
    <el-descriptions-item label="手机号">{{ displayText(application.phone) }}</el-descriptions-item>
    <el-descriptions-item label="学院">{{ displayText(application.college) }}</el-descriptions-item>
    <el-descriptions-item label="专业">{{ displayText(application.major) }}</el-descriptions-item>
    <el-descriptions-item label="班级">{{ displayText(application.className) }}</el-descriptions-item>
    <el-descriptions-item label="年级">{{ gradeLabels[application.grade] || application.grade }}</el-descriptions-item>
    <el-descriptions-item label="入学年份">{{ displayText(application.admissionYear) }}</el-descriptions-item>
    <el-descriptions-item label="一级方向 ID">{{ displayText(application.directionLevel1Id) }}</el-descriptions-item>
    <el-descriptions-item label="一级方向">{{ displayText(application.directionLevel1Name) }}</el-descriptions-item>
    <el-descriptions-item label="二级方向 ID">{{ displayText(application.directionLevel2Id) }}</el-descriptions-item>
    <el-descriptions-item label="二级方向">{{ displayText(application.directionLevel2Name) }}</el-descriptions-item>
    <el-descriptions-item label="状态">
      <StatusTag :value="application.status" />
    </el-descriptions-item>
    <el-descriptions-item label="分组 ID">{{ displayText(application.groupId) }}</el-descriptions-item>
    <el-descriptions-item label="分组">{{ displayText(application.groupName) }}</el-descriptions-item>
    <el-descriptions-item label="备注">{{ displayText(application.statusRemark) }}</el-descriptions-item>
    <el-descriptions-item label="创建时间">{{ formatDateTime(application.createdAt) }}</el-descriptions-item>
    <el-descriptions-item label="更新时间">{{ formatDateTime(application.updatedAt) }}</el-descriptions-item>
    <el-descriptions-item label="自我介绍" :span="column">
      <div class="intro">{{ displayText(application.introduction) }}</div>
    </el-descriptions-item>
  </el-descriptions>
</template>

<script setup lang="ts">
import StatusTag from '@/components/common/StatusTag.vue';
import type { Application } from '@/types/api';
import { displayText, formatDateTime } from '@/utils/format';
import { gradeLabels } from '@/utils/labels';

withDefaults(
  defineProps<{
    application: Application;
    column?: number;
  }>(),
  { column: 1 }
);
</script>

<style scoped>
.intro {
  white-space: pre-wrap;
  line-height: 1.7;
}
</style>
