import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User, AuthResponse } from '../../types/index';
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
    setCredentials: (state, action: PayloadAction<AuthResponse>) => {
      state.user = action.payload.user;
      state.token = action.payload.access_token;
      state.isAuthenticated = true;
      localStorage.setItem('token', action.payload.access_token);
    },
    logout: (state) => {
      localStorage.removeItem('token');
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(authApi.endpoints.login.matchFulfilled, (state, { payload }) => {
        state.user = payload.user;
        state.token = payload.access_token;
        state.isAuthenticated = true;
        localStorage.setItem('token', payload.access_token);
      })
      .addMatcher(authApi.endpoints.register.matchFulfilled, (state, { payload }) => {
        state.user = payload.user;
        state.token = payload.access_token;
        state.isAuthenticated = true;
        localStorage.setItem('token', payload.access_token);
      })
      .addMatcher(authApi.endpoints.getProfile.matchFulfilled, (state, { payload }) => {
        state.user = payload;
      });
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
