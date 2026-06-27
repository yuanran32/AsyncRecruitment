import { deleteData, getData, postData, putData } from './http';
import type { Announcement, PageResult, Scope } from '@/types/api';

export interface AnnouncementPayload {
  title: string;
  content: string;
  scope: Scope;
  groupId?: number | null;
}

export function getAnnouncements(params?: { scope?: Scope; page?: number; size?: number }) {
  return getData<PageResult<Announcement>>('/announcements', params);
}

export function getAnnouncement(id: number | string) {
  return getData<Announcement>(`/announcements/${id}`);
}

export function createAdminAnnouncement(payload: AnnouncementPayload) {
  return postData<Announcement, AnnouncementPayload>('/admin/announcements', payload);
}

export function createLeaderAnnouncement(payload: AnnouncementPayload) {
  return postData<Announcement, AnnouncementPayload>('/leader/announcements', payload);
}

export function updateAnnouncement(id: number | string, payload: AnnouncementPayload) {
  return putData<Announcement, AnnouncementPayload>(`/announcements/${id}`, payload);
}

export function deleteAnnouncement(id: number | string) {
  return deleteData<null>(`/announcements/${id}`);
}
