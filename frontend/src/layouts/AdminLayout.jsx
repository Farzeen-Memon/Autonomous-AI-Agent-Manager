import React from 'react';
import AppLayout from './AppLayout';

const AdminLayout = ({ children, title = "Admin Panel" }) => {
    return (
        <AppLayout title={title} userRole="admin">
            {children}
        </AppLayout>
    );
};

export default AdminLayout;
