import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { logout as reduxLogout, setUser as reduxSetUser } from "../pages/Auth/authSlice";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:8000/api/";
const MEDIA_URL = import.meta.env.VITE_MEDIA_URL || "http://localhost:8000/storage/";

// Frontend routes that don't require authentication
const PUBLIC_ROUTES = [
  "/login",
  "/forgot-password",
  "/reset-password",
];

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Initialize user from cache
  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem("cached_user");
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [checking, setChecking] = useState(Boolean(localStorage.getItem("token")));

  // Create axios instance for auth operations
  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: BASE_URL,
      withCredentials: false,
    });

    instance.interceptors.request.use((cfg) => {
      const token = localStorage.getItem("token");
      if (token) {
        cfg.headers.Authorization = `Bearer ${token}`;
      }
      return cfg;
    });

    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error?.response?.status === 401) {
          window.dispatchEvent(new Event("auth-logout"));
        }
        return Promise.reject(error);
      }
    );

    return instance;
  }, []);

  // Helper function to capitalize first letter
  const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  // Apply user to context + redux + local cache
  const applyUser = useCallback(
    (userData) => {
      if (!isMountedRef.current) return;
      setUser(userData);
      try {
        localStorage.setItem("cached_user", JSON.stringify(userData || {}));
      } catch (err) {
        console.error("Failed to cache user:", err);
      }
      dispatch(reduxSetUser(userData));
    },
    [dispatch]
  );

  // Clear authentication and redirect to login
  const clearAuthAndRedirect = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("cached_user");
    dispatch(reduxLogout());
    if (isMountedRef.current) setUser(null);

    const isPublicRoute = PUBLIC_ROUTES.some((route) => 
      location.pathname.startsWith(route)
    );

    if (!isPublicRoute) {
      navigate("/login", { replace: true });
    }
  }, [dispatch, location.pathname, navigate]);

  // Validate token and fetch user details
  const validateTokenInBg = useCallback(
    async (overrideToken = null) => {
      const token = overrideToken ?? localStorage.getItem("token");
      if (!token) {
        if (isMountedRef.current) setChecking(false);
        if (user) applyUser(null);
        return null;
      }

      setChecking(true);
      try {
        const res = await api.post(
          "me",
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (!isMountedRef.current) return null;

        const payloadUser = res.data?.user ?? res.data;
        const normalized = {
          name: payloadUser?.name ?? "",
          email: payloadUser?.email ?? "",
          profileImage: payloadUser?.image ? MEDIA_URL + payloadUser.image : "",
          type: capitalize(res.data?.roles?.[0] ?? ""),
          roles: res.data?.roles ?? [],
          permissions: res.data?.permissions ?? [],
        };

        applyUser(normalized);
        return normalized;
      } catch (err) {
        console.error("Token validation failed:", err);
        if (isMountedRef.current) {
          applyUser(null);
          // Don't redirect on mount failure - let the route protection handle it
          if (overrideToken) {
            clearAuthAndRedirect();
          }
        }
        return null;
      } finally {
        if (isMountedRef.current) setChecking(false);
      }
    },
    [api, applyUser, clearAuthAndRedirect, user]
  );

  // Initialize auth state and event listeners
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      validateTokenInBg();
    } else {
      setChecking(false);
    }

    const onLogin = (e) => {
      const token = e?.detail?.token;
      if (token) {
        localStorage.setItem("token", token);
        validateTokenInBg(token);
      }
    };

    const onLogout = () => {
      clearAuthAndRedirect();
    };

    window.addEventListener("auth-login", onLogin);
    window.addEventListener("auth-logout", onLogout);

    return () => {
      window.removeEventListener("auth-login", onLogin);
      window.removeEventListener("auth-logout", onLogout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Login function - called after successful authSlice login
  const login = useCallback(
    async (token) => {
      if (!token) return;
      localStorage.setItem("token", token);
      
      // Validate token and fetch user details
      await validateTokenInBg(token);
    },
    [validateTokenInBg]
  );

  // Logout function
  const logout = useCallback(() => {
    window.dispatchEvent(new Event("auth-logout"));
    clearAuthAndRedirect();
  }, [clearAuthAndRedirect]);

  // Permission helpers
  const hasPermission = useCallback(
    (permission) => {
      return !!(user?.permissions && user.permissions.includes(permission));
    },
    [user]
  );

  const hasAnyPermission = useCallback(
    (permissions) => {
      return !!(user?.permissions && permissions.some((p) => user.permissions.includes(p)));
    },
    [user]
  );

  const hasAllPermissions = useCallback(
    (permissions) => {
      return !!(user?.permissions && permissions.every((p) => user.permissions.includes(p)));
    },
    [user]
  );

  const hasRole = useCallback(
    (role) => {
      return !!(user?.roles && user.roles.includes(role));
    },
    [user]
  );

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      checking,
      isAuthenticated: !!localStorage.getItem("token"),
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      hasRole,
    }),
    [
      user,
      login,
      logout,
      checking,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      hasRole,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
};