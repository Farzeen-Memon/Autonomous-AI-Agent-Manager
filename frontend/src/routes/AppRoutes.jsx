import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import AdminPage from '../pages/AdminPage';
import EmployeePage from '../pages/EmployeePage';
import DecisionsPage from '../pages/DecisionsPage';
import AdminEmployeesPage from '../pages/AdminEmployeesPage';
import SettingsPage from '../pages/SettingsPage';
import EmployeeProfilePage from '../pages/EmployeeProfilePage';
import EmployeeTasksPage from '../pages/EmployeeTasksPage';
import RoleSelectionPage from '../pages/RoleSelectionPage';
import AdminProvisioningPage from '../pages/AdminProvisioningPage';
import EmployeeCalibrationPage from '../pages/EmployeeCalibrationPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import AdminHubPage from '../pages/AdminHubPage';
import EmployeeTaskBriefingPage from '../pages/EmployeeTaskBriefingPage';
import ProjectMatchingPage from '../pages/ProjectMatchingPage';
import NeuralMappingPage from '../pages/NeuralMappingPage';
import ProjectDetailsPage from '../pages/ProjectDetailsPage';

const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                {/* Auth Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<RoleSelectionPage />} />
                <Route path="/role-selection" element={<RoleSelectionPage />} />
                <Route path="/admin-provisioning" element={<AdminProvisioningPage />} />
                <Route path="/admin" element={<AdminHubPage />} />
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                <Route path="/admin/project-matching" element={<ProjectMatchingPage />} />
                <Route path="/admin/neural-mapping" element={<NeuralMappingPage />} />
                <Route path="/admin/project-details" element={<ProjectDetailsPage />} />
                <Route path="/admin/employees" element={<AdminEmployeesPage />} />
                <Route path="/admin/decisions" element={<DecisionsPage />} />
                <Route path="/admin/settings" element={<SettingsPage />} />
                <Route path="/admin/profile" element={<AdminPage />} /> {/* Admin profile can share dashboard or have its own */}

                {/* Employee Routes */}
                <Route path="/employee-calibration" element={<EmployeeCalibrationPage />} />
                <Route path="/employee" element={<EmployeeTaskBriefingPage />} />
                <Route path="/employee/tasks" element={<EmployeeTaskBriefingPage />} />
                <Route path="/employee/profile" element={<EmployeeProfilePage />} />
                <Route path="/employee/settings" element={<SettingsPage />} />

                {/* Redirects */}
                <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
        </Router>
    );
};

export default AppRoutes;
