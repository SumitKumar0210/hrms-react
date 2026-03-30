// src/components/PermissionRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

const PermissionRoute = ({ children, permission = null, anyOf = null }) => {
  const { user, checking, hasPermission, hasAnyPermission } = useAuth();
  const location = useLocation();

  if (checking) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Admin bypasses all checks
  if (user?.roles?.includes("Admin") || user?.roles?.includes("Administrator")) return children;

  // Single permission check
  if (permission && !hasPermission(permission)) {
    return <Navigate to="/403" replace state={{ from: location }} />;
  }

  // Any-of permission check
  if (anyOf && !hasAnyPermission(anyOf)) {
    return <Navigate to="/403" replace state={{ from: location }} />;
  }

  return children;
};

export default PermissionRoute;