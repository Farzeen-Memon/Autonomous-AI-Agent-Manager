import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const location = useLocation();
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');

    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
        // Redirect to appropriate dashboard based on actual role
        if (userRole === 'admin') {
            return <Navigate to="/admin/dashboard" replace />;
        } else if (userRole === 'employee') {
            return <Navigate to="/employee" replace />;
        } else {
            return <Navigate to="/login" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
