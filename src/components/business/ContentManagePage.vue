<template>
  <div class="page">
    <PageHeader :title="title" :description="description" />

    <section class="page-section">
      <div class="page-toolbar content-toolbar">
        <div class="toolbar-left">
          <el-button type="primary" :icon="Plus" @click="openCreate">新建{{ itemName }}</el-button>
          <el-select v-if="kind !== 'announcements'" v-model="query.groupId" class="group-select" placeholder="选择责任包" clearable>
            <el-option v-for="group in groups" :key="group.id" :label="group.name" :value="group.id" />
          </el-select>
          <el-select v-if="kind === 'announcements' && mode === 'admin'" v-model="query.scope" class="scope-select" placeholder="全部范围">
            <el-option label="全部范围" value="" />
            <el-option label="全局" value="GLOBAL" />
            <el-option label="组内" value="GROUP" />
          </el-select>
          <div class="toolbar-inline">
            <el-input v-model="query.keyword" class="keyword-input" clearable :placeholder="`搜索${itemName}标题或内容`" @keyup.enter="loadItems" />
            <el-button :icon="Refresh" :loading="loading" @click="loadItems">刷新</el-button>
          </div>
        </div>
      </div>

      <PageTable :data="pagedItems" :loading="loading" empty-text="暂无内容">
        <el-table-column prop="title" label="标题" :min-width="isMobile ? 110 : 220" show-overflow-tooltip />
        <el-table-column v-if="kind === 'announcements'" label="范围" width="96">
          <template #default="{ row }">
            <el-tag effect="plain">{{ scopeLabels[row.scope as Scope] || '组内' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="责任包" :min-width="isMobile ? 100 : 150">
          <template #default="{ row }">{{ resolveGroupName(row) }}</template>
        </el-table-column>
        <el-table-column v-if="kind === 'tasks'" label="满分" width="86">
          <template #default="{ row }">{{ row.maxScore }}</template>
        </el-table-column>
        <el-table-column v-if="kind === 'tasks'" label="截止时间" :min-width="isMobile ? 130 : 170">
          <template #default="{ row }">{{ formatDateTime(row.deadlineAt) }}</template>
        </el-table-column>
        <el-table-column v-if="kind === 'tasks'" label="成员" width="80">
          <template #default="{ row }">{{ displayText(row.memberCount) }}</template>
        </el-table-column>
        <el-table-column v-if="kind === 'tasks'" label="待提交" width="80">
          <template #default="{ row }">{{ displayText(row.pendingCount) }}</template>
        </el-table-column>
        <el-table-column v-if="kind === 'tasks'" label="已提交" width="80">
          <template #default="{ row }">{{ displayText(row.submittedCount) }}</template>
        </el-table-column>
        <el-table-column v-if="kind === 'tasks'" label="已批阅" width="80">
          <template #default="{ row }">{{ displayText(row.reviewedCount) }}</template>
        </el-table-column>
        <el-table-column v-if="kind === 'tasks'" label="完成率" width="90">
          <template #default="{ row }">{{ formatPercent(row.completionRate) }}</template>
        </el-table-column>
        <el-table-column v-if="kind !== 'announcements'" label="附件" min-width="160" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="getAttachment(row)">{{ getAttachmentLabel(getAttachment(row)) }}</span>
            <el-tag v-else-if="hasAttachment(row)" type="success" effect="plain">有附件</el-tag>
            <span v-else class="muted">无</span>
          </template>
        </el-table-column>
        <el-table-column label="发布人" min-width="120">
          <template #default="{ row }">{{ getPublisher(row) }}</template>
        </el-table-column>
        <el-table-column label="发布时间" :min-width="isMobile ? 130 : 170">
          <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="更新时间" :min-width="isMobile ? 130 : 170">
          <template #default="{ row }">{{ formatDateTime(row.updatedAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" :width="actionColumnWidth" fixed="right">
          <template #default="{ row }">
            <div class="table-actions">
              <el-button text type="primary" :icon="View" title="详情" @click="openDetail(row)">
                <span v-if="!isMobile">详情</span>
              </el-button>
              <el-button
                v-if="kind === 'tasks'"
                text
                type="primary"
                :icon="Checked"
                title="批阅"
                @click="openReviews(row)"
              >
                <span v-if="!isMobile">批阅</span>
              </el-button>
              <el-button text type="primary" :icon="Edit" title="编辑" @click="openEdit(row)">
                <span v-if="!isMobile">编辑</span>
              </el-button>
              <el-popconfirm :title="`确认删除该${itemName}？`" confirm-button-text="删除" cancel-button-text="取消" @confirm="handleDelete(row)">
                <template #reference>
                  <el-button text type="danger" :icon="Delete" title="删除">
                    <span v-if="!isMobile">删除</span>
                  </el-button>
                </template>
              </el-popconfirm>
            </div>
          </template>
        </el-table-column>
      </PageTable>

      <el-pagination
        v-model:current-page="query.page"
        v-model:page-size="query.size"
        class="pager"
        :small="isMobile"
        :pager-count="isMobile ? 5 : 7"
        :layout="isMobile ? 'total, prev, pager, next' : 'total, sizes, prev, pager, next'"
        :page-sizes="[10, 20, 50]"
        :total="filteredItems.length"
        @size-change="query.page = 1"
      />
    </section>

    <el-drawer v-model="drawerVisible" :title="editingId ? `编辑${itemName}` : `新建${itemName}`" :size="isMobile ? '100%' : '560px'">
      <el-form ref="formRef" :model="form" :rules="rules" :label-position="isMobile ? 'top' : 'right'" :label-width="isMobile ? undefined : '86px'">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" maxlength="80" show-word-limit />
        </el-form-item>
        <el-form-item v-if="kind === 'announcements' && mode === 'admin'" label="范围" prop="scope">
          <el-radio-group v-model="form.scope">
            <el-radio-button label="GLOBAL">全局</el-radio-button>
            <el-radio-button label="GROUP">组内</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="kind !== 'announcements' || form.scope === 'GROUP'" label="责任包" prop="groupId">
          <el-select v-model="form.groupId" class="full" placeholder="请选择责任包">
            <el-option v-for="group in groups" :key="group.id" :label="group.name" :value="group.id" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="kind === 'tasks'" label="满分" prop="maxScore">
          <el-input-number v-model="form.maxScore" :min="1" :max="1000" />
        </el-form-item>
        <el-form-item v-if="kind === 'tasks'" label="截止时间" prop="deadlineAt">
          <el-date-picker v-model="form.deadlineAt" class="full" type="datetime" value-format="YYYY-MM-DDTHH:mm:ssZ" />
        </el-form-item>
        <el-form-item v-if="kind !== 'announcements'" label="附件">
          <FileUploader
            v-model="form.attachmentFileId"
            :purpose="kind === 'tasks' ? 'TASK_ATTACHMENT' : 'MATERIAL_ATTACHMENT'"
            :existing-file-name="form.attachmentFileName"
            @clear="form.removeAttachment = true"
            @uploaded="form.removeAttachment = false"
          />
        </el-form-item>
        <el-form-item label="正文" prop="contentMarkdown">
          <MarkdownEditor v-model="form.contentMarkdown" :rows="10" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="drawerVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">保存</el-button>
      </template>
    </el-drawer>

    
    <el-drawer v-model="detailVisible" :title="`${itemName}详情`" :size="isMobile ? '100%' : '560px'">
      <div v-loading="detailLoading">
        <template v-if="detailItem">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="标题">{{ displayText(detailItem.title) }}</el-descriptions-item>
            <el-descriptions-item v-if="kind === 'announcements'" label="范围">{{ getScopeLabel(detailItem) }}</el-descriptions-item>
            <el-descriptions-item label="责任包">{{ resolveGroupName(detailItem) }}</el-descriptions-item>
            <el-descriptions-item label="发布人">{{ getPublisher(detailItem) }}</el-descriptions-item>
            <el-descriptions-item v-if="kind === 'tasks'" label="满分">{{ displayText(getTaskValue(detailItem, 'maxScore')) }}</el-descriptions-item>
            <el-descriptions-item v-if="kind === 'tasks'" label="截止时间">{{ formatDateTime(getTaskValue(detailItem, 'deadlineAt')) }}</el-descriptions-item>
            <el-descriptions-item v-if="kind === 'tasks'" label="成员">{{ displayText(getTaskValue(detailItem, 'memberCount')) }}</el-descriptions-item>
            <el-descriptions-item v-if="kind === 'tasks'" label="待提交">{{ displayText(getTaskValue(detailItem, 'pendingCount')) }}</el-descriptions-item>
            <el-descriptions-item v-if="kind === 'tasks'" label="已提交">{{ displayText(getTaskValue(detailItem, 'submittedCount')) }}</el-descriptions-item>
            <el-descriptions-item v-if="kind === 'tasks'" label="已批阅">{{ displayText(getTaskValue(detailItem, 'reviewedCount')) }}</el-descriptions-item>
            <el-descriptions-item v-if="kind === 'tasks'" label="完成率">{{ formatPercent(getTaskValue(detailItem, 'completionRate')) }}</el-descriptions-item>
            <el-descriptions-item label="发布时间">{{ formatDateTime(detailItem.createdAt) }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ formatDateTime(detailItem.updatedAt) }}</el-descriptions-item>
            <el-descriptions-item v-if="getAttachment(detailItem)" label="附件文件名">{{ displayText(getAttachment(detailItem)?.originalFileName) }}</el-descriptions-item>
            <el-descriptions-item v-if="getAttachment(detailItem)" label="附件类型">{{ displayText(getAttachment(detailItem)?.contentType) }}</el-descriptions-item>
            <el-descriptions-item v-if="getAttachment(detailItem)" label="附件大小">{{ formatBytes(getAttachment(detailItem)?.sizeBytes) }}</el-descriptions-item>
            <el-descriptions-item label="正文">
              <div v-if="getItemContent(detailItem)" class="submission-content">
                <MarkdownViewer :content="getItemContent(detailItem)" />
              </div>
              <span v-else class="muted">—</span>
            </el-descriptions-item>
          </el-descriptions>
        </template>
      </div>
    </el-drawer>
    <el-drawer v-model="reviewVisible" title="任务批阅" :size="isMobile ? '100%' : '860px'">
      <div class="review-head">
        <strong>{{ currentTask?.title }}</strong>
        <el-button :icon="Download" @click="downloadSubmissions">批下载</el-button>
      </div>
      <PageTable :data="submissions" :loading="reviewLoading" empty-text="暂无提交记录">
        <el-table-column prop="realName" label="姓名" width="100" />
        <el-table-column prop="username" label="账号" width="130" />
        <el-table-column label="提交时间" min-width="170">
          <template #default="{ row }">{{ formatDateTime(row.submittedAt) }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getSubmissionStatusType(row.status)" effect="plain">{{ getSubmissionStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="附件" min-width="160" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row.attachment">{{ getAttachmentLabel(row.attachment) }}</span>
            <span v-else class="muted">无</span>
          </template>
        </el-table-column>
        <el-table-column prop="score" label="分数" width="80" />
        <el-table-column prop="reviewerUsername" label="批阅人" width="120" />
        <el-table-column prop="reviewComment" label="评语" min-width="160" show-overflow-tooltip />
        <el-table-column label="批阅时间" min-width="170">
          <template #default="{ row }">{{ formatDateTime(row.reviewedAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" :width="reviewActionWidth" fixed="right">
          <template #default="{ row }">
            <div class="table-actions">
              <el-button text type="primary" :icon="View" title="查看" @click="openSubmissionDetail(row)">
                <span v-if="!isMobile">查看</span>
              </el-button>
              <el-button text type="primary" :icon="EditPen" title="评分" @click="openReviewDialog(row)">
                <span v-if="!isMobile">评分</span>
              </el-button>
              <el-popconfirm title="确认打回该提交？" confirm-button-text="打回" cancel-button-text="取消" @confirm="returnSubmission(row)">
                <template #reference>
                  <el-button text type="warning" :icon="RefreshLeft" title="打回">
                    <span v-if="!isMobile">打回</span>
                  </el-button>
                </template>
              </el-popconfirm>
            </div>
          </template>
        </el-table-column>
      </PageTable>
    </el-drawer>

    <el-dialog v-model="scoreVisible" title="提交评分" :width="isMobile ? '92%' : '420px'">
      <el-form :model="scoreForm" :label-position="isMobile ? 'top' : 'right'" :label-width="isMobile ? undefined : '72px'">
        <el-form-item label="分数">
          <el-input-number v-model="scoreForm.score" :min="0" :max="currentTask?.maxScore || 100" />
        </el-form-item>
        <el-form-item label="评语">
          <el-input v-model="scoreForm.comment" type="textarea" :rows="4" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="scoreVisible = false">取消</el-button>
        <el-button type="primary" :loading="scoreSubmitting" @click="submitReview">保存评分</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="submissionVisible" title="提交详情" :width="isMobile ? '96%' : '680px'">
      <template v-if="submissionTarget">
        <el-descriptions :column="isMobile ? 1 : 2" border>
          <el-descriptions-item label="姓名">{{ displayText(submissionTarget.realName) }}</el-descriptions-item>
          <el-descriptions-item label="账号">{{ displayText(submissionTarget.username) }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getSubmissionStatusType(submissionTarget.status)" effect="plain">
              {{ getSubmissionStatusLabel(submissionTarget.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="提交时间">{{ formatDateTime(submissionTarget.submittedAt) }}</el-descriptions-item>
          <el-descriptions-item label="分数">{{ displayText(submissionTarget.score) }}</el-descriptions-item>
          <el-descriptions-item label="批阅人">{{ displayText(submissionTarget.reviewerUsername) }}</el-descriptions-item>
          <el-descriptions-item label="批阅时间">{{ formatDateTime(submissionTarget.reviewedAt) }}</el-descriptions-item>
          <el-descriptions-item label="附件文件名">{{ displayText(submissionTarget.attachment?.originalFileName) }}</el-descriptions-item>
          <el-descriptions-item label="附件类型">{{ displayText(submissionTarget.attachment?.contentType) }}</el-descriptions-item>
          <el-descriptions-item label="附件大小">{{ formatBytes(submissionTarget.attachment?.sizeBytes) }}</el-descriptions-item>
        </el-descriptions>

        <section class="submission-section">
          <h3>提交内容</h3>
          <div v-if="submissionTarget.contentMarkdown" class="submission-content">
            <MarkdownViewer :content="submissionTarget.contentMarkdown" />
          </div>
          <el-empty v-else description="暂无提交内容" :image-size="72" />
        </section>

        <section class="submission-section">
          <h3>附件</h3>
          <el-button v-if="submissionTarget.attachment" :icon="Download" @click="downloadSubmissionAttachment(submissionTarget)">
            {{ submissionTarget.attachment.originalFileName || '下载附件' }}
          </el-button>
          <span v-else class="muted">无</span>
        </section>

        <section class="submission-section">
          <h3>评语</h3>
          <p class="review-comment">{{ submissionTarget.reviewComment }}</p>
        </section>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { Checked, Delete, Download, Edit, EditPen, Plus, Refresh, RefreshLeft, View } from '@element-plus/icons-vue';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { computed, onMounted, reactive, ref } from 'vue';

import { useIsMobile } from '@/composables/useMediaQuery';

import {
  createAdminAnnouncement,
  createAdminMaterial,
  createAdminTask,
  deleteAdminAnnouncement,
  deleteAdminMaterial,
  deleteAdminTask,
  getAdminGroups,
  getAdminManagedTasks,
  getAdminTaskBatchDownloadUrl,
  getAdminTaskSubmissions,
  getAnnouncements,
  getMaterials,
  returnAdminSubmission,
  reviewAdminSubmission,
  updateAdminAnnouncement,
  updateAdminMaterial,
  updateAdminTask
} from '@/api/admin';
import {
  createLeaderAnnouncement,
  createLeaderMaterial,
  createLeaderTask,
  deleteLeaderAnnouncement,
  deleteLeaderMaterial,
  deleteLeaderTask,
  getGroups,
  getLeaderTaskBatchDownloadUrl,
  getLeaderTaskSubmissions,
  getLeaderManagedTasks,
  returnLeaderSubmission,
  reviewLeaderSubmission,
  updateLeaderAnnouncement,
  updateLeaderMaterial,
  updateLeaderTask
} from '@/api/leader';
import { getTask, type GroupSubmissionSummary } from '@/api/tasks';
import FileUploader from '@/components/common/FileUploader.vue';
import PageHeader from '@/components/common/PageHeader.vue';
import PageTable from '@/components/common/PageTable.vue';
import MarkdownEditor from '@/components/markdown/MarkdownEditor.vue';
import MarkdownViewer from '@/components/markdown/MarkdownViewer.vue';
import type { Announcement, Group, Material, Scope, Task, TaskAttachment } from '@/types/api';
import { displayText, formatBytes, formatDateTime, formatPercent } from '@/utils/format';
import { scopeLabels, submissionStatusLabels } from '@/utils/labels';

type Mode = 'leader' | 'admin';
type Kind = 'announcements' | 'materials' | 'tasks';
type ManagedItem = Announcement | Material | Task;

const isMobile = useIsMobile();
const props = defineProps<{
  mode: Mode;
  kind: Kind;
  title: string;
  description: string;
}>();

const itemNameMap: Record<Kind, string> = {
  announcements: '公告',
  materials: '资料',
  tasks: '任务'
};

const itemName = computed(() => itemNameMap[props.kind]);
const actionColumnWidth = computed(() => {
  if (!isMobile.value) return props.kind === 'tasks' ? 360 : 320;
  return props.kind === 'tasks' ? 164 : 124;
});
const reviewActionWidth = computed(() => (isMobile.value ? 128 : 260));
const loading = ref(false);
const submitting = ref(false);
const drawerVisible = ref(false);
const editingId = ref<number | null>(null);
const formRef = ref<FormInstance>();
const groups = ref<Group[]>([]);
const items = ref<ManagedItem[]>([]);
const query = reactive({
  page: 1,
  size: 10,
  groupId: undefined as number | undefined,
  scope: '' as '' | Scope,
  keyword: ''
});
const form = reactive({
  title: '',
  contentMarkdown: '',
  scope: 'GROUP' as Scope,
  groupId: undefined as number | undefined,
  attachmentFileId: null as number | null,
  attachmentFileName: '',
  removeAttachment: false,
  maxScore: 100,
  deadlineAt: ''
});
const rules = computed<FormRules>(() => ({
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  contentMarkdown: [{ required: true, message: '请输入正文', trigger: 'blur' }],
  groupId:
    props.kind !== 'announcements' || form.scope === 'GROUP'
      ? [{ required: true, message: '请选择责任包', trigger: 'change' }]
      : [],
  maxScore: props.kind === 'tasks' ? [{ required: true, message: '请输入满分', trigger: 'blur' }] : [],
  deadlineAt: props.kind === 'tasks' ? [{ required: true, message: '请选择截止时间', trigger: 'change' }] : []
}));

const filteredItems = computed(() => {
  const keyword = query.keyword.trim();
  return items.value.filter((item) => {
    if ('groupId' in item && query.groupId && item.groupId !== query.groupId) return false;
    if ('scope' in item && query.scope && item.scope !== query.scope) return false;
    if (!keyword) return true;
    return [item.title, 'contentMarkdown' in item ? item.contentMarkdown : undefined, 'content' in item ? item.content : undefined]
      .filter(Boolean)
      .some((value) => String(value).includes(keyword));
  });
});
const pagedItems = computed(() => {
  const start = (query.page - 1) * query.size;
  return filteredItems.value.slice(start, start + query.size);
});

const reviewVisible = ref(false);
const reviewLoading = ref(false);
const currentTask = ref<Task | null>(null);
const submissions = ref<GroupSubmissionSummary[]>([]);
const scoreVisible = ref(false);
const scoreSubmitting = ref(false);
const scoreTarget = ref<GroupSubmissionSummary | null>(null);
const scoreForm = reactive({ score: 0, comment: '' });
const submissionVisible = ref(false);
const submissionTarget = ref<GroupSubmissionSummary | null>(null);
const detailVisible = ref(false);
const detailLoading = ref(false);
const detailItem = ref<ManagedItem | null>(null);

onMounted(async () => {
  await loadGroups();
  await loadItems();
});

async function loadGroups() {
  if (props.mode === 'admin') {
    groups.value = await getAdminGroups();
  } else {
    const result = await getGroups({ page: 1, size: 100 });
    groups.value = result.list;
  }
  if (!query.groupId && props.kind !== 'announcements' && groups.value.length) {
    query.groupId = groups.value[0].id;
  }
}

async function loadItems() {
  loading.value = true;
  try {
    if (props.kind === 'announcements') {
      items.value = await getAnnouncements({ scope: query.scope || undefined, keyword: query.keyword || undefined });
    } else if (props.kind === 'materials') {
      items.value = await getMaterials({ keyword: query.keyword || undefined, groupId: query.groupId });
    } else {
      if (!query.groupId) {
        items.value = [];
      } else {
        items.value =
          props.mode === 'admin' ? await getAdminManagedTasks(query.groupId) : await getLeaderManagedTasks(query.groupId);
      }
    }
    query.page = 1;
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  editingId.value = null;
  resetForm();
  drawerVisible.value = true;
}

async function openEdit(item: ManagedItem) {
  editingId.value = item.id;
  const source = await hydrateItem(item);
  form.title = source.title;
  form.contentMarkdown = getItemContent(source);
  form.scope = 'scope' in source ? source.scope || 'GROUP' : 'GROUP';
  form.groupId = getItemGroupId(source) || undefined;
  const attachment = getAttachment(source);
  form.attachmentFileId = attachment?.id ?? attachment?.fileId ?? ('attachmentFileId' in source ? source.attachmentFileId || null : null);
  form.attachmentFileName =
    attachment?.originalFileName ?? ('attachmentFileName' in source ? source.attachmentFileName || '' : '');
  form.removeAttachment = false;
  form.maxScore = 'maxScore' in source ? source.maxScore : 100;
  form.deadlineAt = 'deadlineAt' in source ? source.deadlineAt : '';
  drawerVisible.value = true;
}

function resetForm() {
  form.title = '';
  form.contentMarkdown = '';
  form.scope = props.mode === 'admin' ? 'GLOBAL' : 'GROUP';
  form.groupId = groups.value[0]?.id;
  form.attachmentFileId = null;
  form.attachmentFileName = '';
  form.removeAttachment = false;
  form.maxScore = 100;
  form.deadlineAt = '';
}

async function submitForm() {
  await formRef.value?.validate();
  submitting.value = true;
  try {
    if (props.kind === 'announcements') {
      const payload = {
        title: form.title,
        contentMarkdown: form.contentMarkdown,
        scope: props.mode === 'leader' ? ('GROUP' as Scope) : form.scope,
        groupId: form.scope === 'GROUP' ? form.groupId || null : null
      };
      if (props.mode === 'admin') {
        editingId.value ? await updateAdminAnnouncement(editingId.value, payload) : await createAdminAnnouncement(payload);
      } else {
        editingId.value ? await updateLeaderAnnouncement(editingId.value, payload) : await createLeaderAnnouncement(payload);
      }
    } else if (props.kind === 'materials') {
      const payload = {
        title: form.title,
        contentMarkdown: form.contentMarkdown,
        attachmentFileId: form.attachmentFileId,
        removeAttachment: form.removeAttachment
      };
      if (!form.groupId) return;
      if (props.mode === 'admin') {
        editingId.value
          ? await updateAdminMaterial(form.groupId, editingId.value, payload)
          : await createAdminMaterial(form.groupId, payload);
      } else {
        editingId.value
          ? await updateLeaderMaterial(form.groupId, editingId.value, payload)
          : await createLeaderMaterial(form.groupId, payload);
      }
    } else {
      const payload = {
        title: form.title,
        contentMarkdown: form.contentMarkdown,
        attachmentFileId: form.attachmentFileId,
        removeAttachment: form.removeAttachment,
        maxScore: form.maxScore,
        deadlineAt: form.deadlineAt
      };
      if (!form.groupId) return;
      if (props.mode === 'admin') {
        editingId.value ? await updateAdminTask(form.groupId, editingId.value, payload) : await createAdminTask(form.groupId, payload);
      } else {
        editingId.value
          ? await updateLeaderTask(form.groupId, editingId.value, payload)
          : await createLeaderTask(form.groupId, payload);
      }
    }
    ElMessage.success('保存成功');
    drawerVisible.value = false;
    await loadItems();
  } finally {
    submitting.value = false;
  }
}

async function handleDelete(item: ManagedItem) {
  if (props.kind === 'announcements') {
    props.mode === 'admin' ? await deleteAdminAnnouncement(item.id) : await deleteLeaderAnnouncement(item.id);
  } else if (props.kind === 'materials') {
    const groupId = 'groupId' in item ? item.groupId : undefined;
    if (!groupId) return;
    props.mode === 'admin' ? await deleteAdminMaterial(groupId, item.id) : await deleteLeaderMaterial(groupId, item.id);
  } else {
    const groupId = 'groupId' in item ? item.groupId : undefined;
    if (!groupId) return;
    props.mode === 'admin' ? await deleteAdminTask(groupId, item.id) : await deleteLeaderTask(groupId, item.id);
  }
  ElMessage.success('删除成功');
  await loadItems();
}

async function openReviews(task: Task) {
  currentTask.value = task;
  reviewVisible.value = true;
  reviewLoading.value = true;
  try {
    submissions.value =
      props.mode === 'admin' ? await getAdminTaskSubmissions(task.id) : await getLeaderTaskSubmissions(task.id);
  } finally {
    reviewLoading.value = false;
  }
}

function openReviewDialog(row: GroupSubmissionSummary) {
  scoreTarget.value = row;
  scoreForm.score = row.score ?? 0;
  scoreForm.comment = row.reviewComment || '';
  scoreVisible.value = true;
}

function openSubmissionDetail(row: GroupSubmissionSummary) {
  submissionTarget.value = row;
  submissionVisible.value = true;
}

async function submitReview() {
  if (!currentTask.value || !scoreTarget.value) return;
  scoreSubmitting.value = true;
  try {
    const payload = { score: scoreForm.score, comment: scoreForm.comment };
    props.mode === 'admin'
      ? await reviewAdminSubmission(currentTask.value.id, scoreTarget.value.userId, payload)
      : await reviewLeaderSubmission(currentTask.value.id, scoreTarget.value.userId, payload);
    ElMessage.success('评分已保存');
    scoreVisible.value = false;
    await openReviews(currentTask.value);
  } finally {
    scoreSubmitting.value = false;
  }
}

async function returnSubmission(row: GroupSubmissionSummary) {
  if (!currentTask.value) return;
  props.mode === 'admin'
    ? await returnAdminSubmission(currentTask.value.id, row.userId)
    : await returnLeaderSubmission(currentTask.value.id, row.userId);
  ElMessage.success('已打回提交');
  await openReviews(currentTask.value);
}

function downloadSubmissions() {
  if (!currentTask.value?.groupId) return;
  const url =
    props.mode === 'admin'
      ? getAdminTaskBatchDownloadUrl(currentTask.value.groupId, currentTask.value.id)
      : getLeaderTaskBatchDownloadUrl(currentTask.value.groupId, currentTask.value.id);
  window.open(url, '_blank');
}

async function openDetail(item: ManagedItem) {
  detailItem.value = item;
  detailVisible.value = true;
  if (props.kind !== 'tasks') return;
  detailLoading.value = true;
  try {
    detailItem.value = await hydrateItem(item);
  } finally {
    detailLoading.value = false;
  }
}

async function hydrateItem(item: ManagedItem): Promise<ManagedItem> {
  if (props.kind !== 'tasks') return item;
  try {
    const detail = await getTask(item.id);
    return { ...(item as Task), ...detail };
  } catch {
    return item;
  }
}

function getScopeLabel(item: ManagedItem) {
  if (!('scope' in item) || !item.scope) return '—';
  return scopeLabels[item.scope] || item.scope;
}

function getItemGroupId(item: ManagedItem) {
  return 'groupId' in item ? item.groupId ?? null : null;
}

function getItemPublisherUserId(item: ManagedItem) {
  return 'publisherUserId' in item ? item.publisherUserId ?? null : null;
}

function getTaskValue<K extends keyof Task>(item: ManagedItem, key: K): Task[K] | undefined {
  return key in item ? (item as Task)[key] : undefined;
}

function getItemContent(item: ManagedItem) {
  if (item.contentMarkdown) return item.contentMarkdown;
  if ('content' in item && item.content) return String(item.content);
  return '';
}

function resolveGroupName(item: ManagedItem) {
  if ('groupName' in item && item.groupName) return item.groupName;
  if ('groupId' in item) return getGroupName(item.groupId);
  return '—';
}

function getPublisher(item: ManagedItem) {
  if ('publisherUsername' in item && item.publisherUsername) return item.publisherUsername;
  if ('publisherName' in item && item.publisherName) return item.publisherName;
  if ('publisherUserId' in item && item.publisherUserId) return `#${item.publisherUserId}`;
  return '—';
}

function getGroupName(groupId?: number | null) {
  return groups.value.find((group) => group.id === groupId)?.name || (groupId ? `责任包 #${groupId}` : '—');
}

function hasSubmissionDetail(row: GroupSubmissionSummary) {
  return Boolean(row.contentMarkdown || row.attachment);
}

function getSubmissionStatusLabel(status?: GroupSubmissionSummary['status']) {
  return status ? submissionStatusLabels[status] || status : '—';
}

function getSubmissionStatusType(status?: GroupSubmissionSummary['status']) {
  if (status === 'REVIEWED') return 'success';
  if (status === 'SUBMITTED') return 'warning';
  return 'info';
}

function downloadSubmissionAttachment(row: GroupSubmissionSummary) {
  if (!currentTask.value || !row.attachment) return;
  const url =
    props.mode === 'admin'
      ? `/api/v1/admin/tasks/${currentTask.value.id}/submissions/${row.userId}/attachment`
      : `/api/v1/leader/tasks/${currentTask.value.id}/submissions/${row.userId}/attachment`;
  window.open(url, '_blank');
}

function getAttachment(item: ManagedItem): TaskAttachment | null {
  return 'attachment' in item ? item.attachment || null : null;
}

function getAttachmentLabel(attachment?: TaskAttachment | null) {
  if (!attachment) return '无';
  const name = attachment.originalFileName || '附件';
  const size = attachment.sizeBytes != null ? ` (${formatBytes(attachment.sizeBytes)})` : '';
  return `${name}${size}`;
}

function hasAttachment(item: ManagedItem) {
  return Boolean(
    getAttachment(item) ||
      ('attachmentFileId' in item && item.attachmentFileId) ||
      ('attachmentUrl' in item && item.attachmentUrl) ||
      ('hasAttachment' in item && item.hasAttachment)
  );
}
</script>

<style scoped>
.content-toolbar {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
}

.toolbar-left {
  display: flex;
  gap: 10px;
  align-items: center;
  flex: 1 1 480px;
  flex-wrap: wrap;
  min-width: 0;
}

.content-toolbar > :deep(.el-button) {
  flex-shrink: 0;
}

/* 桌面端透明容器：搜索框与刷新按钮沿用原布局，刷新靠右 */
.toolbar-inline {
  display: contents;
}

.toolbar-inline > :deep(.el-button) {
  flex-shrink: 0;
  margin-left: auto;
}

.keyword-input {
  width: 260px;
  flex: 1 1 260px;
  min-width: 220px;
}

.group-select {
  width: 220px;
  flex: 1 1 220px;
  min-width: 180px;
}

.scope-select {
  width: 130px;
  flex: 0 1 130px;
}

.full {
  width: 100%;
}

.pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.review-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

@media (max-width: 960px) {
  .review-head {
    align-items: stretch;
    flex-direction: column;
  }
}

.submission-section {
  margin-top: 18px;
}

.submission-section h3 {
  margin: 0 0 10px;
  font-size: 15px;
  font-weight: 600;
}

.submission-content {
  min-height: 96px;
  padding: 12px 14px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  background: var(--el-fill-color-blank);
}

.review-comment {
  margin: 0;
  white-space: pre-wrap;
  line-height: 1.7;
  color: var(--app-text);
}

@media (max-width: 960px) {
  .content-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-left {
    width: 100%;
    flex: 0 0 auto;
  }

  /* 移动端搜索框与刷新按钮同行，减少堆叠行数 */
  .toolbar-inline {
    display: flex;
    gap: 10px;
    width: 100%;
  }

  .toolbar-inline .keyword-input {
    flex: 1 1 auto;
    width: auto;
    min-width: 0;
  }

  .toolbar-inline > :deep(.el-button) {
    margin-left: 0;
    flex: 0 0 auto;
  }

  .group-select,
  .scope-select {
    width: 100%;
    min-width: 0;
    flex: 1 1 100%;
  }
}
</style>
