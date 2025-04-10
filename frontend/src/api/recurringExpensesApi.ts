import { baseApi } from './baseApi';
import { CreateRecurringExpenseDto, RecurringExpense, UpdateRecurringExpenseDto } from '../types';

export const recurringExpensesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRecurringExpenses: builder.query<RecurringExpense[], void>({
      query: () => '/recurring-expenses',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'RecurringExpenses' as const, id: _id })),
              { type: 'RecurringExpenses', id: 'LIST' },
            ]
          : [{ type: 'RecurringExpenses', id: 'LIST' }],
    }),
    getRecurringExpenseById: builder.query<RecurringExpense, string>({
      query: (id) => `/recurring-expenses/${id}`,
      providesTags: (result, error, id) => [{ type: 'RecurringExpenses', id }],
    }),
    createRecurringExpense: builder.mutation<RecurringExpense, CreateRecurringExpenseDto>({
      query: (recurringExpense) => ({
        url: '/recurring-expenses',
        method: 'POST',
        body: recurringExpense,
      }),
      invalidatesTags: [{ type: 'RecurringExpenses', id: 'LIST' }],
    }),
    updateRecurringExpense: builder.mutation<
      RecurringExpense,
      { id: string; recurringExpense: UpdateRecurringExpenseDto }
    >({
      query: ({ id, recurringExpense }) => ({
        url: `/recurring-expenses/${id}`,
        method: 'PATCH',
        body: recurringExpense,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'RecurringExpenses', id }],
    }),
    deleteRecurringExpense: builder.mutation<void, string>({
      query: (id) => ({
        url: `/recurring-expenses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'RecurringExpenses', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetRecurringExpensesQuery,
  useGetRecurringExpenseByIdQuery,
  useCreateRecurringExpenseMutation,
  useUpdateRecurringExpenseMutation,
  useDeleteRecurringExpenseMutation,
} = recurringExpensesApi;
