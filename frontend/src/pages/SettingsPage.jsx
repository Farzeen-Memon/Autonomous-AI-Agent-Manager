import React from 'react';
import AdminLayout from '../layouts/AdminLayout';
import EmployeeLayout from '../layouts/EmployeeLayout';
import Settings from '../components/admin/Settings';
import { useUser } from '../context/UserContext';

const SettingsPage = () => {
    const { user } = useUser();
    const Layout = user?.role === 'employee' ? EmployeeLayout : AdminLayout;

    return (
        <Layout title="Settings">
            <Settings />
        </Layout>
    );
};

export default SettingsPage;
