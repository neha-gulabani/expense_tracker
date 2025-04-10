import { baseApi } from './baseApi';
import { 
  CreateExpenseDto, 
  Expense, 
  FilterExpenseDto, 
  PaginatedResponse, 
  PaginationQueryDto, 
  UpdateExpenseDto,
  DailyExpenseData,
  CategoryTotal,
  GenerateReportParams
} from '../types';
import { format, subDays } from 'date-fns';

export const expensesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getExpenses: builder.query<PaginatedResponse<Expense>, void>({      
      query: () => ({
        url: '/expenses',
        method: 'GET',
      }),
      transformResponse: (response: any) => {
        console.log('Raw expenses response:', response);
        
        if (Array.isArray(response)) {
          return {
            data: response,
            total: response.length,
            page: 1,
            limit: response.length
          };
        }
        
        // If the response is empty or null
        if (!response) {
          return {
            data: [],
            total: 0,
            page: 1,
            limit: 10
          };
        }
        
        // If we got a single expense object (not in an array and not paginated)
        if (!Array.isArray(response) && !response.data && typeof response === 'object') {
          return {
            data: [response],
            total: 1,
            page: 1,
            limit: 10
          };
        }
        
        // If we have a properly formatted paginated response
        if (response.data) {
          return response;
        }
        
        // Fallback for any other unexpected response format
        return {
          data: [],
          total: 0,
          page: 1,
          limit: 10
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({ type: 'Expenses' as const, id: _id })),
              { type: 'Expenses', id: 'LIST' },
            ]
          : [{ type: 'Expenses', id: 'LIST' }],
    }),
    getExpenseById: builder.query<Expense, string>({
      query: (id) => `/expenses/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Expenses', id }],
    }),
    createExpense: builder.mutation<Expense, CreateExpenseDto>({
      query: (expense) => ({
        url: '/expenses',
        method: 'POST',
        body: expense,
      }),
      invalidatesTags: [{ type: 'Expenses', id: 'LIST' }, { type: 'Expenses', id: 'DAILY' }],
    }),
    updateExpense: builder.mutation<Expense, { id: string; expense: UpdateExpenseDto }>({
      query: ({ id, expense }) => ({
        url: `/expenses/${id}`,
        method: 'PATCH',
        body: expense,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Expenses', id }, { type: 'Expenses', id: 'LIST' }, { type: 'Expenses', id: 'DAILY' }],
    }),
    deleteExpense: builder.mutation<void, string>({
      query: (id) => ({
        url: `/expenses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Expenses', id: 'LIST' }, { type: 'Expenses', id: 'DAILY' }],
    }),
    getDailyExpenses: builder.query<DailyExpenseData[], void>({      
      query: () => {
        // Include default date range for last 30 days
        const endDate = format(new Date(), 'yyyy-MM-dd');
        const startDate = format(subDays(new Date(), 30), 'yyyy-MM-dd');
        
        console.log('Requesting daily expenses with date range:', { startDate, endDate });
        
        return {
          url: `/expenses/analytics/daily?startDate=${startDate}&endDate=${endDate}`,
          method: 'GET',
        };
      },
      transformResponse: (response: any) => {
        console.log('Raw daily expenses response:', response);
        
        // If response is empty or null, return empty array
        if (!response) {
          console.log('Response is null or undefined, returning empty array');
          return [];
        }
        
        // If response is not an array, wrap it in an array
        if (!Array.isArray(response)) {
          console.log('Response is not an array, wrapping it:', response);
          // If it's an object with expected properties, wrap it
          if (response._id && typeof response.totalAmount !== 'undefined') {
            return [response];
          }
          // If it's some other type of object, try to extract data property
          if (response.data && Array.isArray(response.data)) {
            return response.data;
          }
          // Last resort, return empty array
          return [];
        }
        
        console.log('Response is an array with length:', response.length);
        return response;
      },
      providesTags: [{ type: 'Expenses', id: 'DAILY' }],
    }),
    getCategoryTotals: builder.query<CategoryTotal[], void>({      
      query: () => {
        // Include default date range for last 30 days
        const endDate = format(new Date(), 'yyyy-MM-dd');
        const startDate = format(subDays(new Date(), 30), 'yyyy-MM-dd');
        
        console.log('Requesting category totals with date range:', { startDate, endDate });
        
        return {
          url: `/expenses/analytics/category?startDate=${startDate}&endDate=${endDate}`,
          method: 'GET',
        };
      },
      transformResponse: (response: any) => {
        console.log('Raw category totals response:', response);
        
        // If response is empty or null, return empty array
        if (!response) {
          console.log('Response is null or undefined, returning empty array');
          return [];
        }
        
        // If response is not an array, wrap it in an array
        if (!Array.isArray(response)) {
          console.log('Response is not an array, wrapping it:', response);
          // If it's an object with expected properties, wrap it
          if (response.category && typeof response.amount !== 'undefined') {
            return [response];
          }
          // If it's some other type of object, try to extract data property
          if (response.data && Array.isArray(response.data)) {
            return response.data;
          }
          // Last resort, return empty array
          return [];
        }
        
        console.log('Response is an array with length:', response.length);
        return response;
      },
      providesTags: [{ type: 'Expenses', id: 'CATEGORY' }],
    }),
    getRecentExpenses: builder.query<Expense[], void>({      
      query: () => {
        console.log('Making getRecentExpenses API request');
        return {
          url: `/expenses/recent`,
          method: 'GET',
        };
      },
      transformResponse: (response: any) => {
        console.log('Raw recent expenses response:', JSON.stringify(response, null, 2));
        
        // If response is empty or null, return empty array
        if (!response) {
          console.log('Recent expenses response is null or undefined');
          return [];
        }
        
        // If response is already an array
        if (Array.isArray(response)) {
          console.log('Recent expenses response is an array with length:', response.length);
          console.log('First expense in array:', response.length > 0 ? JSON.stringify(response[0], null, 2) : 'No expenses');
          return response;
        }
        
        // If response has data property (paginated response)
        if (response.data && Array.isArray(response.data)) {
          console.log('Recent expenses response has data array with length:', response.data.length);
          console.log('First expense in data array:', response.data.length > 0 ? JSON.stringify(response.data[0], null, 2) : 'No expenses');
          return response.data;
        }
        
        // If response is a single object, wrap it in an array
        if (typeof response === 'object') {
          console.log('Recent expenses response is a single object:', JSON.stringify(response, null, 2));
          
          // Check if it's a paginated response with a different structure
          if (response.items && Array.isArray(response.items)) {
            console.log('Found items array with length:', response.items.length);
            return response.items;
          }
          
          // Check if it has a results property
          if (response.results && Array.isArray(response.results)) {
            console.log('Found results array with length:', response.results.length);
            return response.results;
          }
          
          return [response];
        }
        
        // Fallback
        console.log('Recent expenses response format not recognized');
        return [];
      },
      providesTags: [{ type: 'Expenses', id: 'LIST' }],
    }),
    generateReport: builder.mutation<{ success: boolean; message: string }, GenerateReportParams>(
      {
      query: (params) => ({
        url: '/reports/generate',
        method: 'POST',
        body: params
      }),
   
    }),
  }),
});

export const {
  useGetExpensesQuery,
  useGetExpenseByIdQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
  useGetDailyExpensesQuery,
  useGetCategoryTotalsQuery,
  useGetRecentExpensesQuery,
  useGenerateReportMutation
} = expensesApi;
