// Base entity types
export interface BaseEntity {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
}

// User types
export interface User extends BaseEntity {
  email: string;
  name: string;
}

// Category types
export interface Category extends BaseEntity {
  name: string;
  color?: string;
  userId: string;
}

// Expense types
export interface Expense extends BaseEntity {
  amount: number;
  date: string;
  description: string;
  category: Category | string;
  userId: string;
}

export interface CreateExpenseDto {
  amount: number;
  date: string;
  description: string;
  categoryName?: string;
}

export interface UpdateExpenseDto {
  amount?: number;
  date?: string;
  description?: string;
  categoryName?: string;
}

// Recurring Expense types
export enum RecurringInterval {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly'
}

export interface RecurringExpense extends BaseEntity {
  amount: number;
  description: string;
  category?: Category | string;
  user?: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  lastProcessed?: string;
  isActive: boolean;
}

export interface CreateRecurringExpenseDto {
  amount: number;
  description: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  categoryId: string;
  isActive?: boolean;
}

export interface UpdateRecurringExpenseDto extends Partial<CreateRecurringExpenseDto> {}

// Pagination and filtering
export interface PaginationQueryDto {
  page?: number;
  limit?: number;
}

export interface FilterExpenseDto {
  startDate?: string;
  endDate?: string;
  category?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Report types
export interface DailyExpenseData {
  date: string;
  amount: number;
  _id?: string; // Backend might return this as the date
}

export interface CategoryTotal {
  category: string;
  total: number;
  amount?: number; // For backward compatibility
  color?: string;
}

export interface GenerateReportParams {
  startDate: string;
  endDate: string;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Form types
export interface ExpenseFormValues {
  amount: string;
  date: string;
  description: string;
  category: string;
}

// Select component types
export interface SelectOption {
  value: string;
  label: string;
}

// Auth types
export interface AuthResponse {
  token: string;
  user: User;
}

// Category DTOs
export interface CreateCategoryDto {
  name: string;
  color: string;
}

export interface UpdateCategoryDto {
  name?: string;
  color?: string;
}
