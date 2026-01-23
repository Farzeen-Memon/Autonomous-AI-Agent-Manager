import React from 'react';
import AdminLayout from '../layouts/AdminLayout';
import Settings from '../components/admin/Settings';

const SettingsPage = () => {
    return (
        <AdminLayout title="Settings">
            <Settings />
        </AdminLayout>
    );
};

export default SettingsPage;
