
import React from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { API_BASE_URL } from '../utils/constants';

const AdminEmployeesPage = () => {
    const [employees, setEmployees] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/employees/`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setEmployees(data);
                }
            } catch (error) {
                console.error('Error fetching employees:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchEmployees();
    }, []);

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
                                <th className="px-6 py-3 font-medium">Designation</th>
                                <th className="px-6 py-3 font-medium">Status</th>
                                <th className="px-6 py-3 font-medium">Active Projects</th>
                                <th className="px-6 py-3 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-subtle)]">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center text-slate-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="material-symbols-outlined animate-spin text-2xl">refresh</span>
                                            <p className="font-mono uppercase tracking-widest text-xs">Loading Personnel...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : employees.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center text-slate-500 italic">
                                        No neural nodes registered.
                                    </td>
                                </tr>
                            ) : (
                                employees.map(emp => (
                                    <tr key={emp.profile._id} className="hover:bg-[var(--bg-surface-hover)] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary overflow-hidden">
                                                    {emp.profile.avatar_url ? (
                                                        <img src={emp.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="material-icons-outlined text-sm">person</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-[var(--text-primary)]">{emp.profile.full_name}</div>
                                                    <div className="text-xs text-[var(--text-secondary)]">{emp.profile.user_id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-[var(--text-primary)]">
                                                {emp.profile.specialization || "Unassigned"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="badge badge-success">
                                                Operational
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-[var(--text-secondary)]">0</td>
                                        <td className="px-6 py-4">
                                            <button className="text-[var(--text-primary)] hover:text-[var(--primary-base)] text-sm font-medium">Profile</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminEmployeesPage;
