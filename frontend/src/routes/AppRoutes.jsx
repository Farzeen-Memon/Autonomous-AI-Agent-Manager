import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/auth/ProtectedRoute';
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
import DeploymentPage from '../pages/DeploymentPage';

const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                {/* Auth Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<RoleSelectionPage />} />
                <Route path="/role-selection" element={<RoleSelectionPage />} />
                <Route path="/admin-provisioning" element={<AdminProvisioningPage />} />
                <Route path="/employee-calibration" element={<EmployeeCalibrationPage />} />

                {/* Protected Admin Routes */}
                <Route path="/admin" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <AdminHubPage />
                    </ProtectedRoute>
                } />
                <Route path="/admin/dashboard" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboardPage />
                    </ProtectedRoute>
                } />
                <Route path="/admin/deployment" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <DeploymentPage />
                    </ProtectedRoute>
                } />
                <Route path="/admin/project-matching" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <ProjectMatchingPage />
                    </ProtectedRoute>
                } />
                <Route path="/admin/neural-mapping" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <NeuralMappingPage />
                    </ProtectedRoute>
                } />
                <Route path="/admin/project-details" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <ProjectDetailsPage />
                    </ProtectedRoute>
                } />
                <Route path="/admin/employees" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <AdminEmployeesPage />
                    </ProtectedRoute>
                } />
                <Route path="/admin/decisions" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <DecisionsPage />
                    </ProtectedRoute>
                } />
                <Route path="/admin/settings" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <SettingsPage />
                    </ProtectedRoute>
                } />
                <Route path="/admin/profile" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <AdminPage />
                    </ProtectedRoute>
                } />

                {/* Protected Employee Routes */}
                <Route path="/employee/calibration" element={
                    <ProtectedRoute allowedRoles={['employee']}>
                        <EmployeeCalibrationPage />
                    </ProtectedRoute>
                } />
                <Route path="/employee" element={
                    <ProtectedRoute allowedRoles={['employee']}>
                        <EmployeePage />
                    </ProtectedRoute>
                } />
                <Route path="/employee/tasks" element={
                    <ProtectedRoute allowedRoles={['employee']}>
                        <EmployeePage />
                    </ProtectedRoute>
                } />
                <Route path="/employee/profile" element={
                    <ProtectedRoute allowedRoles={['employee']}>
                        <EmployeeProfilePage />
                    </ProtectedRoute>
                } />
                <Route path="/employee/settings" element={
                    <ProtectedRoute allowedRoles={['employee']}>
                        <SettingsPage />
                    </ProtectedRoute>
                } />

                {/* Redirects */}
                <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
        </Router>
    );
};

export default AppRoutes;
