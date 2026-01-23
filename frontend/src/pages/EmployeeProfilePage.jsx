import React from 'react';
import EmployeeLayout from '../layouts/EmployeeLayout';
import Profile from '../components/employee/Profile';

const EmployeeProfilePage = () => {
    return (
        <EmployeeLayout title="My Professional Profile">
            <Profile />
        </EmployeeLayout>
    );
};

export default EmployeeProfilePage;
