<template>
  <main class="auth-layout">
    <section class="auth-panel">
      <div class="brand">
        <strong>实验室招新平台</strong>
        <PeriodBadge :period="metaStore.period" />
      </div>
      <router-view />
    </section>
  </main>
</template>

<script setup lang="ts">
import PeriodBadge from '@/components/common/PeriodBadge.vue';
import { useMetaStore } from '@/stores/meta';

const metaStore = useMetaStore();
</script>

<style scoped>
.auth-layout {
  display: grid;
  min-height: 100vh;
  place-items: center;
  padding: 24px;
  background:
    linear-gradient(135deg, rgba(37, 99, 235, 0.12), rgba(22, 131, 95, 0.1)),
    var(--app-bg);
}

.auth-panel {
  width: min(440px, 100%);
  padding: 28px;
  border: 1px solid var(--app-border);
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 20px 50px rgba(31, 41, 55, 0.08);
}

.brand {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.brand strong {
  font-size: 20px;
}
</style>
