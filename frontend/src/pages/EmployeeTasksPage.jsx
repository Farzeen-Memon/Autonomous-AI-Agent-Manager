import React from 'react';
import EmployeeLayout from '../layouts/EmployeeLayout';
import TaskDashboard from '../components/employee/TaskDashboard';

const EmployeeTasksPage = () => {
    return (
        <EmployeeLayout title="Task Management">
            <TaskDashboard />
        </EmployeeLayout>
    );
};

export default EmployeeTasksPage;
