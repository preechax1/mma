import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user } = useAuth();

    // If no user is logged in, redirect to login page
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // If user role is not in the allowed roles list, redirect to home page
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to={user?.role === 'admin' ? '/' : '/store'} replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
