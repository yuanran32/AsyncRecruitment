import { getData } from './http';
import type { Group, GroupMember } from '@/types/api';

export function getGroup(id: number | string) {
  return getData<Group>(`/groups/${id}`);
}

export function getGroupMembers(id: number | string) {
  return getData<GroupMember[]>(`/groups/${id}/members`);
}
