<template>
  <article class="markdown-body" v-html="safeHtml" />
</template>

<script setup lang="ts">
import DOMPurify from 'dompurify';
import MarkdownIt from 'markdown-it';
import { computed } from 'vue';

const props = defineProps<{
  content?: string;
}>();

const md = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true
});

const safeHtml = computed(() => DOMPurify.sanitize(md.render(props.content || '')));
</script>

<style scoped>
.markdown-body {
  line-height: 1.72;
  color: var(--app-text);
}

.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3) {
  margin: 20px 0 10px;
}

.markdown-body :deep(p) {
  margin: 8px 0;
}

.markdown-body :deep(code) {
  padding: 2px 6px;
  border-radius: 4px;
  background: #eef2f7;
}
</style>
