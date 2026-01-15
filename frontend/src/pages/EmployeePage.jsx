import React from 'react';
import EmployeeLayout from '../layouts/EmployeeLayout';
import TaskDashboard from '../components/employee/TaskDashboard';

const EmployeePage = () => {
    return (
        <EmployeeLayout>
            <TaskDashboard />
        </EmployeeLayout>
    );
};

export default EmployeePage;
