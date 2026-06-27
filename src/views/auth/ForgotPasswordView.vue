<template>
  <div>
    <PageHeader title="找回密码" description="输入邮箱后发送找回验证码。" />
    <el-form class="auth-form" label-position="top" @submit.prevent="handleSubmit">
      <el-form-item label="邮箱">
        <el-input v-model="email" placeholder="user@example.com" />
      </el-form-item>
      <el-button type="primary" native-type="submit" :loading="submitting" class="full">
        发送验证码
      </el-button>
    </el-form>
    <div class="links">
      <router-link :to="resetLink">已有验证码，去重置</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import { forgotPassword } from '@/api/auth';
import PageHeader from '@/components/common/PageHeader.vue';
import { isValidEmail, normalizeEmail } from '@/utils/authValidation';

const router = useRouter();
const email = ref('');
const submitting = ref(false);
const resetLink = computed(() => ({
  path: '/reset-password',
  query: normalizeEmail(email.value) ? { email: normalizeEmail(email.value) } : {}
}));

async function handleSubmit() {
  if (!isValidEmail(email.value)) {
    ElMessage.warning('请输入有效邮箱');
    return;
  }

  const normalizedEmail = normalizeEmail(email.value);
  submitting.value = true;
  try {
    await forgotPassword(normalizedEmail);
    ElMessage.success('验证码已发送');
    await router.push({ path: '/reset-password', query: { email: normalizedEmail } });
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.auth-form {
  margin-top: 18px;
}

.full {
  width: 100%;
}

.links {
  margin-top: 16px;
  color: var(--app-primary);
}
</style>