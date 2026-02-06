import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { successMessage, errorMessage, getErrorMessage } from "../../toast";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// Create axios instance with interceptor
export const apiClient = axios.create({
  baseURL: BASE_URL,
});

// Setup interceptor for automatic token attachment
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Setup response interceptor for 401 handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      console.warn("401 Unauthorized - triggering logout");
      localStorage.removeItem("token");
      sessionStorage.removeItem("redirectAfterLogin");
      window.dispatchEvent(new Event("auth-logout"));
    }
    return Promise.reject(error);
  }
);

// Login Thunk
export const authLogin = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BASE_URL}login`, credentials);
        console.log(res);
      // Save token in localStorage
      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);

        // Dispatch custom event for AuthContext to listen
        window.dispatchEvent(
          new CustomEvent("auth-login", {
            detail: { token: res.data.token },
          })
        );
      }

      successMessage(res.data.message);
      return res.data;
    } catch (error) {
      const errMsg = getErrorMessage(error);
      errorMessage(errMsg);
      return rejectWithValue(errMsg);
    }
  }
);

// Logout Thunk
export const authLogout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.post(
        `${BASE_URL}auth/logout`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      localStorage.removeItem("token");
      sessionStorage.removeItem("redirectAfterLogin");

      // Dispatch custom event for AuthContext to listen
      window.dispatchEvent(new Event("auth-logout"));

      successMessage(res.data.message);
      return res.data;
    } catch (error) {
      // Even if API fails, still logout locally
      localStorage.removeItem("token");
      sessionStorage.removeItem("redirectAfterLogin");
      window.dispatchEvent(new Event("auth-logout"));

      const errMsg = getErrorMessage(error);
      errorMessage(errMsg);
      return rejectWithValue(errMsg);
    }
  }
);

const auth = createSlice({
  name: "auth",
  initialState: {
    isAuthenticated: !!localStorage.getItem("token"),
    user: null,
    token: localStorage.getItem("token") || null,
    loading: false,
    error: null,
    message: null,
  },
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = null;
      localStorage.removeItem("token");
      sessionStorage.removeItem("redirectAfterLogin");
    },

    clearAuthMessages: (state) => {
      state.error = null;
      state.message = null;
    },

    setUser: (state, action) => {
      state.user = action.payload;
      if (action.payload) {
        state.isAuthenticated = true;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(authLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(authLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user ?? null;
        state.token = action.payload.token ?? action.payload.token ?? null;
        state.error = null;

        if (state.token) {
          state.isAuthenticated = true;
        }
      })
      .addCase(authLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })

      // Logout cases
      .addCase(authLogout.pending, (state) => {
        state.loading = true;
      })
      .addCase(authLogout.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = null;
      })
      .addCase(authLogout.rejected, (state) => {
        state.loading = false;
        // Still clear auth state even if API call failed
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      });
  },
});

export const { logout, clearAuthMessages, setUser } = auth.actions;
export default auth.reducer;