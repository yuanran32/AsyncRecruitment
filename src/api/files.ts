import http from './http';
import type { ApiResponse, UploadedFile } from '@/types/api';

export type BizType = 'MATERIAL' | 'TASK' | 'SUBMISSION';

export async function uploadFile(file: File, bizType: BizType): Promise<UploadedFile> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('bizType', bizType);

  const response = await http.post<ApiResponse<UploadedFile>>('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data.data;
}
