import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Create our baseQuery instance
const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:3000',
  prepareHeaders: (headers, { getState }: any) => {
    // Get the token from the state
    const token = getState().auth.token;
    
    // If we have a token, add it to the headers
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
      console.log('Setting Authorization header with token:', token);
    } else {
      // Try to get token from localStorage as fallback
      const localToken = localStorage.getItem('token');
      if (localToken) {
        headers.set('Authorization', `Bearer ${localToken}`);
        console.log('Setting Authorization header with localStorage token:', localToken);
      } else {
        console.log('No token found in state or localStorage');
      }
    }
    return headers;
  },
});

// Create our API service
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Expenses', 'Categories', 'RecurringExpenses', 'User'],
  endpoints: () => ({}),
});
