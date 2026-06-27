import type { LoginPayload } from '@/api/auth';
import type { User } from '@/types/api';

const MOCK_SESSION_KEY = 'lab_recruit_mock_user';

export interface MockAccount {
  label: string;
  email: string;
  password: string;
  user: User;
}

export const mockAccounts: MockAccount[] = [
  {
    label: '新生',
    email: 'student@example.com',
    password: 'Pass1234',
    user: {
      id: 1,
      username: 'student',
      email: 'student@example.com',
      role: 'FRESHMAN',
      status: 'ACTIVE',
      emailVerified: true,
      groups: []
    }
  },
  {
    label: '负责人',
    email: 'leader@example.com',
    password: 'Pass1234',
    user: {
      id: 2,
      username: 'leader',
      email: 'leader@example.com',
      role: 'LEADER',
      status: 'ACTIVE',
      emailVerified: true,
      leaderGroupId: 10,
      groups: [{ id: 10, name: '后端-Java-1组' }]
    }
  },
  {
    label: '管理员',
    email: 'admin@example.com',
    password: 'Admin1234',
    user: {
      id: 3,
      username: 'admin',
      email: 'admin@example.com',
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
      groups: []
    }
  }
];

export function findMockUser(payload: LoginPayload): User | null {
  const account = mockAccounts.find(
    (item) => item.email === payload.email.trim() && item.password === payload.password
  );

  return account ? { ...account.user } : null;
}

export function saveMockUser(user: User) {
  localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(user));
}

export function loadMockUser(): User | null {
  const raw = localStorage.getItem(MOCK_SESSION_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as User;
  } catch {
    localStorage.removeItem(MOCK_SESSION_KEY);
    return null;
  }
}

export function clearMockUser() {
  localStorage.removeItem(MOCK_SESSION_KEY);
}
