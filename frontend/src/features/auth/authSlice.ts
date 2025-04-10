import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User } from '../../types';
import { authApi } from '../../api/authApi';

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('token', action.payload.token);
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle login response
      .addMatcher(authApi.endpoints.login.matchFulfilled, (state, { payload }) => {
        state.user = payload.user;
        state.token = payload.access_token;
        state.isAuthenticated = true;
        localStorage.setItem('token', payload.access_token);
      })
      // Handle register response
      .addMatcher(authApi.endpoints.register.matchFulfilled, (state, { payload }) => {
        state.user = payload.user;
        state.token = payload.access_token;
        state.isAuthenticated = true;
        localStorage.setItem('token', payload.access_token);
      })
      // Handle get profile response
      .addMatcher(authApi.endpoints.getProfile.matchFulfilled, (state, { payload }) => {
        state.user = payload;
      });
  },
});

export const { logout, setCredentials } = authSlice.actions;
export default authSlice.reducer;
