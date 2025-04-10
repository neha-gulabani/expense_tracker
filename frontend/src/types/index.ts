// User types
export interface User {
  _id?: string;
  name: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
}

// Category types
export interface Category {
  _id?: string;
  name: string;
  color?: string;
  user?: string;
}

// Expense types
export interface Expense {
  _id?: string;
  amount: number;
  description: string;
  date: string;
  category?: Category;
  user?: string;
}

export interface CreateExpenseDto {
  amount: number;
  description: string;
  date?: string;
  categoryName?: string;
}

export interface UpdateExpenseDto {
  amount?: number;
  description?: string;
  date?: string;
  categoryName?: string;
}

export interface FilterExpenseDto {
  startDate?: string;
  endDate?: string;
  category?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface PaginationQueryDto {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// RecurringExpense types
export enum RecurringInterval {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

export interface RecurringExpense {
  _id?: string;
  amount: number;
  description: string;
  interval: RecurringInterval;
  startDate: string;
  endDate?: string;
  category?: Category;
  user?: string;
  isActive: boolean;
  lastProcessed: string;
}

export interface CreateRecurringExpenseDto {
  amount: number;
  description: string;
  interval: RecurringInterval;
  startDate: string;
  endDate?: string;
  categoryName?: string;
}

export interface UpdateRecurringExpenseDto {
  amount?: number;
  description?: string;
  interval?: RecurringInterval;
  startDate?: string;
  endDate?: string;
  categoryName?: string;
  isActive?: boolean;
}

// Chart data types
export interface DailyExpenseData {
  _id: string; // Date in YYYY-MM-DD format
  totalAmount: number;
  count: number;
}

export interface CategoryTotal {
  category: string;
  amount: number;
}

// Report types
export interface GenerateReportParams {
  startDate?: string;
  endDate?: string;
  format?: string;
}
