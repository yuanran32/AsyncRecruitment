export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
  requestId: string;
}

export interface PageResult<T> {
  list: T[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

export interface PageQuery {
  page?: number;
  size?: number;
}

export type Role = 'FRESHMAN' | 'LEADER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'DISABLED';
export type PeriodType = 'REGISTRATION' | 'SELECTION' | 'INTERVIEW' | 'NOT_OPEN' | 'FINISHED';
export type ApplicationStatus = 'SUBMITTED' | 'GROUPED' | 'REJECTED' | 'WITHDRAWN';
export type Scope = 'GLOBAL' | 'GROUP';
export type Grade = 'YEAR_1' | 'YEAR_2' | 'YEAR_3' | 'YEAR_4' | 'GRADUATED';
export type SubmissionStatus = 'PENDING' | 'SUBMITTED' | 'REVIEWED';
export type DisplaySubmissionStatus = SubmissionStatus | 'EXPIRED';
export type FilePurpose = 'TASK_ATTACHMENT' | 'TASK_SUBMISSION_ATTACHMENT' | 'MATERIAL_ATTACHMENT';
export type AuditModule =
  | 'AUTH'
  | 'APPLICATION'
  | 'GROUP'
  | 'TASK'
  | 'ANNOUNCEMENT'
  | 'MATERIAL'
  | 'CONFIG'
  | 'EXPORT'
  | 'FILE'
  | 'NOTIFICATION';
export type AuditSeverity = 'NORMAL' | 'IMPORTANT' | 'MAJOR';
export type NotificationType =
  | 'APPLICATION_REJECTED'
  | 'APPLICATION_GROUPED'
  | 'APPLICATION_UNASSIGNED'
  | 'TASK_PUBLISHED'
  | 'TASK_RETURNED'
  | 'TASK_REVIEWED'
  | 'ANNOUNCEMENT_PUBLISHED'
  | 'MATERIAL_PUBLISHED';

export interface TaskAttachment {
  id?: number;
  fileId?: number;
  originalFileName: string;
  contentType?: string | null;
  sizeBytes?: number | null;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
  status?: UserStatus;
  emailVerified?: boolean;
  leaderGroupId?: number;
  leaderGroups?: SimpleGroup[];
  groups?: SimpleGroup[];
  leaderGroupCount?: number;
  applicationCount?: number;
  groupCount?: number;
  lastLoginAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface SimpleGroup {
  id: number;
  name: string;
  currentSize?: number;
}

export interface CurrentPeriod {
  currentPeriod: PeriodType;
  serverTime: string;
}

export interface Direction {
  id: number;
  name: string;
  level: 1 | 2;
  parentId?: number | null;
  sortOrder?: number;
  enabled?: boolean;
  children?: Direction[];
}

export interface Application {
  id: number;
  userId?: number;
  username?: string;
  email?: string;
  realName: string;
  phone: string;
  college: string;
  major: string;
  className: string;
  grade: Grade;
  admissionYear: number;
  directionLevel1Id: number;
  directionLevel2Id: number;
  directionLevel1Name?: string | null;
  directionLevel2Name?: string | null;
  introduction?: string;
  status: ApplicationStatus;
  statusRemark?: string | null;
  groupId?: number | null;
  groupName?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationForm {
  realName: string;
  phone: string;
  college: string;
  major: string;
  className: string;
  grade: Grade;
  admissionYear: number;
  directionLevel1Id: number;
  directionLevel2Id: number;
  introduction?: string;
}

export interface ApplicationSummary {
  applicationCount: number;
  submittedCount: number;
  groupedCount: number;
  groupIds: number[];
}

export interface Announcement {
  id: number;
  title: string;
  content?: string;
  contentMarkdown?: string;
  scope: Scope;
  groupId?: number | null;
  groupName?: string | null;
  publisherUserId?: number | null;
  publisherUsername?: string;
  publisherName?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Material {
  id: number;
  groupId?: number;
  groupName?: string | null;
  title: string;
  summary?: string;
  content?: string;
  contentMarkdown?: string;
  attachment?: TaskAttachment | null;
  attachmentFileId?: number | null;
  attachmentFileName?: string | null;
  attachmentUrl?: string | null;
  directionLevel1Id?: number | null;
  directionLevel2Id?: number | null;
  hasAttachment?: boolean;
  publisherUserId?: number | null;
  publisherUsername?: string;
  publisherName?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Task {
  id: number;
  groupId: number;
  title: string;
  content?: string;
  contentMarkdown?: string;
  scope?: Scope;
  groupName?: string;
  attachment?: TaskAttachment | null;
  attachmentFileId?: number | null;
  attachmentFileName?: string | null;
  attachmentUrl?: string | null;
  maxScore: number;
  deadlineAt: string;
  publisherUserId?: number | null;
  publisherUsername?: string | null;
  publisherName?: string;
  submissionStatus?: SubmissionStatus;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  reviewStatus?: SubmissionStatus;
  submission?: TaskSubmission;
  memberCount?: number;
  pendingCount?: number;
  submittedCount?: number;
  reviewedCount?: number;
  completionRate?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskSubmission {
  id?: number;
  taskId: number;
  userId?: number;
  username?: string | null;
  realName?: string | null;
  status: SubmissionStatus;
  submittedAt?: string | null;
  content?: string;
  contentMarkdown?: string | null;
  attachment?: TaskAttachment | null;
  attachmentFileId?: number | null;
  attachmentFileName?: string | null;
  attachmentUrl?: string | null;
  reviewerUserId?: number | null;
  reviewerUsername?: string | null;
  score?: number | null;
  reviewComment?: string | null;
  reviewedAt?: string | null;
  submitVersion?: number;
  isLatest?: boolean;
}

export interface TaskScore {
  taskId: number;
  taskTitle: string;
  score: number;
  maxScore: number;
  comment?: string;
  reviewedAt: string;
}

export interface Group {
  id: number;
  name: string;
  directionLevel1Id: number;
  directionLevel1Name?: string | null;
  directionLevel2Id: number;
  directionLevel2Name?: string | null;
  grade: Grade;
  admissionYear: number;
  maxSize: number;
  currentSize?: number;
  leaderUserId?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface GroupMember {
  userId: number;
  username: string;
  realName: string;
  applicationId: number;
  grade: Grade;
  admissionYear: number;
  directionLevel1Name: string;
  directionLevel2Name: string;
  introduction?: string | null;
  applicationStatus: ApplicationStatus;
}

export interface UploadedFile {
  id: number;
  fileId?: number;
  fileName: string;
  originalFileName?: string;
  contentType?: string;
  url?: string;
  size: number;
}

export interface AdminDashboardOverview {
  totalUsers: number;
  totalApplications: number;
  groupedApplications: number;
  ungroupedApplications: number;
  totalGroups: number;
  totalTasks: number;
  totalSubmittedTaskResults: number;
  totalReviewedTaskResults: number;
}

export interface AdminDashboardSummary extends AdminDashboardOverview {
  leaderCount: number;
}

export interface GroupDashboardSummary {
  groupId: number;
  groupName: string;
  memberCount: number;
  taskCount: number;
  submittedCount: number;
  reviewedCount: number;
  pendingCount: number;
  completionRate: number;
}

export interface GroupDashboardDetail extends GroupDashboardSummary {
  tasks: Task[];
}

export interface AuditLog {
  id: number;
  module: AuditModule | string;
  action: string;
  severity?: AuditSeverity | string;
  actorUserId?: number | null;
  actorUsername?: string | null;
  actorRole?: Role | null;
  targetType?: string | null;
  targetId?: number | null;
  success?: boolean;
  summary?: string | null;
  detailJson?: string | null;
  requestId?: string | null;
  requestPath?: string | null;
  clientIp?: string | null;
  createdAt: string;
  operatorName?: string;
  target?: string;
  detail?: string;
  ip?: string;
}

export interface NotificationSummary {
  unreadCount: number;
}

export interface NotificationItem {
  id: number;
  title: string;
  content: string;
  type?: NotificationType | string;
  relatedType?: string | null;
  relatedId?: number | null;
  senderUserId?: number | null;
  readAt?: string | null;
  updatedAt?: string;
  channel?: 'SYSTEM' | 'EMAIL';
  targetRole?: Role;
  status?: 'DRAFT' | 'SENT';
  createdAt: string;
  sentAt?: string | null;
}
