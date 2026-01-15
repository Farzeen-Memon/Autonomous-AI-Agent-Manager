import React from 'react';
import AdminLayout from '../layouts/AdminLayout';
import WorkspaceDashboard from '../components/admin/WorkspaceDashboard';

const AdminPage = () => {
    return (
        <AdminLayout>
            <WorkspaceDashboard />
        </AdminLayout>
    );
};

export default AdminPage;
