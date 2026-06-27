import type { ApplicationStatus, Grade, PeriodType, Role, Scope, SubmissionStatus, UserStatus } from '@/types/api';

export const roleLabels: Record<Role, string> = {
  FRESHMAN: '新生',
  LEADER: '负责人',
  ADMIN: '管理员'
};

export const userStatusLabels: Record<UserStatus, string> = {
  ACTIVE: '正常',
  DISABLED: '禁用'
};

export const periodLabels: Record<PeriodType, string> = {
  REGISTRATION: '报名期',
  SELECTION: '选拔期',
  INTERVIEW: '面试期',
  FINISHED: '已结束'
};

export const applicationStatusLabels: Record<ApplicationStatus, string> = {
  SUBMITTED: '待分组',
  GROUPED: '已分组',
  REJECTED: '已驳回',
  WITHDRAWN: '已撤回'
};

export const submissionStatusLabels: Record<SubmissionStatus, string> = {
  NOT_SUBMITTED: '未提交',
  SUBMITTED: '已提交',
  EXPIRED: '已截止',
  REVIEWED: '已批阅'
};

export const scopeLabels: Record<Scope, string> = {
  GLOBAL: '全局',
  GROUP: '组内'
};

export const gradeLabels: Record<Grade, string> = {
  YEAR_1: '大一',
  YEAR_2: '大二',
  YEAR_3: '大三',
  YEAR_4: '大四',
  GRADUATED: '已毕业'
};