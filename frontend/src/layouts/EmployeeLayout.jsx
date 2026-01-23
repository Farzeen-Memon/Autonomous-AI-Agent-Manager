import React from 'react';
import AppLayout from './AppLayout';

const EmployeeLayout = ({ children, title = "Employee Portal" }) => {
    return (
        <AppLayout title={title} userRole="employee">
            {children}
        </AppLayout>
    );
};

export default EmployeeLayout;
