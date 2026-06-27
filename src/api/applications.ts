import { deleteData, getData, postData, putData } from './http';
import type { Application, ApplicationForm, ApplicationSummary } from '@/types/api';

export function getApplications() {
  return getData<Application[]>('/applications');
}

export function getApplication(id: number | string) {
  return getData<Application>(`/applications/${id}`);
}

export function createApplication(payload: ApplicationForm) {
  return postData<Application, ApplicationForm>('/applications', payload);
}

export function updateApplication(id: number | string, payload: ApplicationForm) {
  return putData<Application, ApplicationForm>(`/applications/${id}`, payload);
}

export function withdrawApplication(id: number | string) {
  return deleteData<null>(`/applications/${id}`);
}

export function getApplicationSummary() {
  return getData<ApplicationSummary>('/applications/summary');
}
