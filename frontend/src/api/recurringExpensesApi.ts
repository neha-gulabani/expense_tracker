import { baseApi } from './baseApi';
import { RecurringExpense, CreateRecurringExpenseDto, UpdateRecurringExpenseDto } from '../types';

export const recurringExpensesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRecurringExpenses: builder.query<{ data: RecurringExpense[]; total: number; page: number; limit: number }, {
      page?: number;
      limit?: number;
      category?: string;
      minAmount?: number;
      maxAmount?: number;
      isActive?: boolean;
    }>({
      query: (params) => {
        console.log('API Request Params:', params);
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.category) queryParams.append('category', params.category);
        if (params.minAmount) queryParams.append('minAmount', params.minAmount.toString());
        if (params.maxAmount) queryParams.append('maxAmount', params.maxAmount.toString());
        if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

        return {
          url: `/recurring-expenses?${queryParams.toString()}`,
          method: 'GET',
        };
      },
      transformResponse: (response: any) => {
        console.log('Raw API Response:', response);
        const transformedResponse = {
          data: response.data || [],
          total: response.total || 0,
          page: response.page || 1,
          limit: response.limit || 10
        };
        console.log('Transformed Response:', transformedResponse);
        return transformedResponse;
      },
      providesTags: (result) => {
        if (!result?.data) {
          return [{ type: 'RecurringExpense' as const, id: 'LIST' }];
        }
        return [
          ...result.data.map((expense) => ({ type: 'RecurringExpense' as const, id: expense._id })),
          { type: 'RecurringExpense', id: 'LIST' },
        ];
      },
    }),
    getRecurringExpenseById: builder.query<RecurringExpense, string>({
      query: (id) => `/recurring-expenses/${id}`,
      providesTags: (result, error, id) => [{ type: 'RecurringExpense', id }],
    }),
    createRecurringExpense: builder.mutation<RecurringExpense, CreateRecurringExpenseDto>({
      query: (recurringExpense) => ({
        url: '/recurring-expenses',
        method: 'POST',
        body: recurringExpense,
      }),
      invalidatesTags: [{ type: 'RecurringExpense', id: 'LIST' }],
    }),
    updateRecurringExpense: builder.mutation<
      RecurringExpense,
      { id: string; data: UpdateRecurringExpenseDto }
    >({
      query: ({ id, data }) => ({
        url: `/recurring-expenses/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'RecurringExpense', id },
        { type: 'RecurringExpense', id: 'LIST' },
      ],
    }),
    deleteRecurringExpense: builder.mutation<void, string>({
      query: (id) => ({
        url: `/recurring-expenses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'RecurringExpense', id: 'LIST' }],
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
