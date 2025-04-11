import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  Expense,
  CreateExpenseDto,
  UpdateExpenseDto,
  Category,
  RecurringExpense,
  CreateRecurringExpenseDto,
  UpdateRecurringExpenseDto,
  DailyExpenseData,
  CategoryTotal,
  GenerateReportParams,
  User,
  AuthResponse,
  LoginCredentials,
  CreateCategoryDto,
  UpdateCategoryDto,
  PaginatedResponse,
  FilterExpenseDto,
  PaginationQueryDto,
 
} from '../types';

// Create our baseQuery instance
const baseQuery = fetchBaseQuery({
  baseUrl: '/api',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as any).auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

// Create our API service
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Expense', 'Category', 'RecurringExpense', 'User'],
  endpoints: (builder) => ({
    // Auth endpoints
    login: builder.mutation<AuthResponse, LoginCredentials>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation<AuthResponse, LoginCredentials & { name: string }>({
      query: (credentials) => ({
        url: '/auth/register',
        method: 'POST',
        body: credentials,
      }),
    }),
    getCurrentUser: builder.query<User, void>({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),

    // Expense endpoints
    getExpenses: builder.query<PaginatedResponse<Expense>, PaginationQueryDto & FilterExpenseDto>({
      query: (params) => ({
        url: '/expenses',
        params: {
          ...params,
          populate: 'category'
        },
      }),
      providesTags: ['Expense'],
    }),
    getRecentExpenses: builder.query<Expense[], void>({
      query: () => '/expenses/recent',
      providesTags: ['Expense'],
    }),
    createExpense: builder.mutation<Expense, CreateExpenseDto>({
      query: (expense) => ({
        url: '/expenses',
        method: 'POST',
        body: expense,
      }),
      invalidatesTags: ['Expense'],
    }),
    updateExpense: builder.mutation<Expense, { id: string; data: UpdateExpenseDto }>({
      query: ({ id, data }) => ({
        url: `/expenses/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Expense'],
    }),
    deleteExpense: builder.mutation<void, string>({
      query: (id) => ({
        url: `/expenses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Expense'],
    }),

    // Category endpoints
    getCategories: builder.query<Category[], void>({
      query: () => '/categories',
      providesTags: ['Category'],
    }),
    createCategory: builder.mutation<Category, CreateCategoryDto>({
      query: (category) => ({
        url: '/categories',
        method: 'POST',
        body: category,
      }),
      invalidatesTags: ['Category'],
    }),
    updateCategory: builder.mutation<Category, { id: string; data: UpdateCategoryDto }>({
      query: ({ id, data }) => ({
        url: `/categories/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Category'],
    }),
    deleteCategory: builder.mutation<void, string>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Category'],
    }),

    // RecurringExpense endpoints
    getRecurringExpenses: builder.query<PaginatedResponse<RecurringExpense>, FilterExpenseDto>({
      query: (params) => ({
        url: '/recurring-expenses',
        params,
      }),
      providesTags: ['RecurringExpense'],
    }),
    createRecurringExpense: builder.mutation<RecurringExpense, CreateRecurringExpenseDto>({
      query: (expense) => ({
        url: '/recurring-expenses',
        method: 'POST',
        body: expense,
      }),
      invalidatesTags: ['RecurringExpense'],
    }),
    updateRecurringExpense: builder.mutation<RecurringExpense, { id: string; data: UpdateRecurringExpenseDto }>({
      query: ({ id, data }) => ({
        url: `/recurring-expenses/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['RecurringExpense'],
    }),
    deleteRecurringExpense: builder.mutation<void, string>({
      query: (id) => ({
        url: `/recurring-expenses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['RecurringExpense'],
    }),

    // Report endpoints
    getDailyExpenses: builder.query<DailyExpenseData[], { startDate: string; endDate: string }>({
      query: (params) => ({
        url: '/expenses/analytics/daily',
        params,
      }),
    }),
    getCategoryTotals: builder.query<CategoryTotal[], { startDate: string; endDate: string }>({
      query: (params) => ({
        url: '/expenses/analytics/category',
        params,
      }),
    }),
    generateReport: builder.mutation<Blob, GenerateReportParams>({
      query: (params) => ({
        url: '/reports/generate',
        method: 'POST',
        body: params,
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetCurrentUserQuery,
  useGetExpensesQuery,
  useGetRecentExpensesQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetRecurringExpensesQuery,
  useCreateRecurringExpenseMutation,
  useUpdateRecurringExpenseMutation,
  useDeleteRecurringExpenseMutation,
  useGetDailyExpensesQuery,
  useGetCategoryTotalsQuery,
  useGenerateReportMutation,
} = baseApi;
