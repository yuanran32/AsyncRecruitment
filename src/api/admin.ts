import { deleteData, getData, postData, putData } from './http';
import type {
  AdminDashboardSummary,
  Direction,
  Grade,
  Group,
  PageResult,
  PeriodType,
  Role,
  User
} from '@/types/api';

export interface PeriodConfig {
  id?: number;
  periodType: PeriodType;
  startTime: string;
  endTime: string;
  enabled: boolean;
}

export interface DirectionPayload {
  parentId?: number | null;
  name: string;
  sortOrder: number;
  enabled: boolean;
}

export interface GroupPayload {
  name: string;
  directionLevel1Id: number;
  directionLevel2Id: number;
  grade: Grade;
  admissionYear: number;
  maxSize: number;
}

export function getDashboardSummary() {
  return getData<AdminDashboardSummary>('/admin/dashboard/summary');
}

export function getAdminPeriods() {
  return getData<PeriodConfig[]>('/admin/periods');
}

export function saveAdminPeriods(periods: PeriodConfig[]) {
  return postData<PeriodConfig[], { periods: PeriodConfig[] }>('/admin/periods', { periods });
}

export function updateAdminPeriod(id: number | string, payload: PeriodConfig) {
  return putData<PeriodConfig, PeriodConfig>(`/admin/periods/${id}`, payload);
}

export function getAdminDirections() {
  return getData<Direction[]>('/admin/directions');
}

export function createDirection(payload: DirectionPayload) {
  return postData<Direction, DirectionPayload>('/admin/directions', payload);
}

export function updateDirection(id: number | string, payload: DirectionPayload) {
  return putData<Direction, DirectionPayload>(`/admin/directions/${id}`, payload);
}

export function deleteDirection(id: number | string) {
  return deleteData<null>(`/admin/directions/${id}`);
}

export function getAdminUsers(params?: {
  role?: Role;
  applicationStatus?: string;
  groupId?: number;
  keyword?: string;
  page?: number;
  size?: number;
}) {
  return getData<PageResult<User>>('/admin/users', params);
}

export function getAdminUser(id: number | string) {
  return getData<User>(`/admin/users/${id}`);
}

export function getAdminGroups(params?: {
  directionLevel1Id?: number;
  directionLevel2Id?: number;
  grade?: Grade;
  admissionYear?: number;
  page?: number;
  size?: number;
}) {
  return getData<PageResult<Group>>('/admin/groups', params);
}

export function createGroup(payload: GroupPayload) {
  return postData<Group, GroupPayload>('/admin/groups', payload);
}

export function updateGroup(id: number | string, payload: GroupPayload) {
  return putData<Group, GroupPayload>(`/admin/groups/${id}`, payload);
}

export function deleteGroup(id: number | string) {
  return deleteData<null>(`/admin/groups/${id}`);
}

export function autoAssignGroups(dryRun: boolean) {
  return postData<
    { assignedCount: number; unassignedCount: number; unassignedApplicationIds: number[] },
    { dryRun: boolean }
  >('/admin/groups/auto-assign', { dryRun });
}

export function addApplicationToGroup(groupId: number | string, applicationId: number | string) {
  return postData<null>(`/admin/groups/${groupId}/applications/${applicationId}`);
}

export function removeApplicationFromGroup(groupId: number | string, applicationId: number | string) {
  return deleteData<null>(`/admin/groups/${groupId}/applications/${applicationId}`);
}

export function assignLeader(groupId: number | string, userId: number) {
  return postData<null, { userId: number }>(`/admin/groups/${groupId}/leader`, { userId });
}

export function removeLeader(groupId: number | string) {
  return deleteData<null>(`/admin/groups/${groupId}/leader`);
}

export function getExportUrl(type: 'APPLICATION' | 'GROUP_RESULT' | 'TASK_SCORE') {
  return `/api/v1/admin/dashboard/export?type=${type}`;
}
