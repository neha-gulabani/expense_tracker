// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}


// DTO types
export interface CreateCategoryDto {
  name: string;
  color: string;
}

export interface UpdateCategoryDto {
  name?: string;
  color?: string;
}

// User types
export interface User {
  id: string;
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

// Category types
export interface Category {
  id: string;
  name: string;
  color: string;
  userId: string;
}

// Expense types
export interface Expense {
  id: string;
  amount: number;
  description: string;
  date: string;
  categoryId: string;
  userId: string;
  category?: Category;
}

export interface CreateExpenseDto {
  amount: number;
  description: string;
  date: string;
  categoryId: string;
}

export interface UpdateExpenseDto {
  amount?: number;
  description?: string;
  date?: string;
  categoryId?: string;
}

export interface FilterExpenseDto {
  page?: number;
  limit?: number;
  category?: string;
  minAmount?: number;
  maxAmount?: number;
  isActive?: boolean;
}

export interface PaginationQueryDto {
  page?: number;
  limit?: number;
  isActive?: boolean;
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
  YEARLY = 'yearly'
}

export interface RecurringExpense {
  id: string;
  amount: number;
  description: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  categoryId: string;
  userId: string;
  isActive: boolean;
  category?: Category;
}

export interface CreateRecurringExpenseDto {
  amount: number;
  description: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  categoryId: string;
}

export interface UpdateRecurringExpenseDto {
  amount?: number;
  description?: string;
  frequency?: string;
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  isActive?: boolean;
}

// Chart data types
export interface DailyExpenseData {
  date: string;
  amount: number;
}

export interface CategoryTotal {
  category: string;
  total: number;
  color?: string;
}

// Report types
export interface GenerateReportParams {
  startDate: string;
  endDate: string;
  format?: string;
}



export interface RecurringExpenseQueryDto extends PaginationQueryDto, FilterExpenseDto {}
