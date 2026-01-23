
import React from 'react';
import AdminLayout from '../layouts/AdminLayout';

const AdminEmployeesPage = () => {
    const employees = [
        { id: 1, name: "Alice Dev", role: "Frontend", status: "Busy", email: "alice@nexo.ai", projects: 2 },
        { id: 2, name: "Bob Backend", role: "Backend", status: "Available", email: "bob@nexo.ai", projects: 0 },
        { id: 3, name: "Charlie AI", role: "AI Engineer", status: "Busy", email: "charlie@nexo.ai", projects: 1 },
        { id: 4, name: "Dave Data", role: "Data Scientist", status: "Available", email: "dave@nexo.ai", projects: 0 },
        { id: 5, name: "Eve UI", role: "Designer", status: "Assigned", email: "eve@nexo.ai", projects: 1 },
    ];

    return (
        <AdminLayout title="Team Management">
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-semibold">Employees</h1>
                        <p className="text-[var(--text-secondary)]">Manage your workforce</p>
                    </div>
                    <button className="btn btn-primary">+ Add Employee</button>
                </div>

                <div className="card p-0 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[var(--bg-surface-hover)] border-b border-[var(--border-subtle)] text-[var(--text-secondary)]">
                            <tr>
                                <th className="px-6 py-3 font-medium">Name</th>
                                <th className="px-6 py-3 font-medium">Role</th>
                                <th className="px-6 py-3 font-medium">Status</th>
                                <th className="px-6 py-3 font-medium">Active Projects</th>
                                <th className="px-6 py-3 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-subtle)]">
                            {employees.map(emp => (
                                <tr key={emp.id} className="hover:bg-[var(--bg-surface-hover)] transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 flex items-center justify-center text-[var(--text-secondary)]">
                                                <span className="material-icons-outlined text-sm">person</span>
                                            </div>
                                            <div>
                                                <div className="font-medium text-[var(--text-primary)]">{emp.name}</div>
                                                <div className="text-xs text-[var(--text-secondary)]">{emp.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-[var(--text-secondary)]">{emp.role}</td>
                                    <td className="px-6 py-4">
                                        <span className={`badge ${emp.status === 'Available' ? 'badge-success' : 'badge-warning'
                                            }`}>
                                            {emp.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-[var(--text-secondary)]">{emp.projects}</td>
                                    <td className="px-6 py-4">
                                        <button className="text-[var(--text-primary)] hover:text-[var(--primary-base)] text-sm font-medium">Edit</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminEmployeesPage;
