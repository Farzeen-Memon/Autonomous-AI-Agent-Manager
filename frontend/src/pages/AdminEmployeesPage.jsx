
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

                <div className="card text-slate-300 p-0 overflow-hidden border border-white/10 relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0"></div>
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 border-b border-white/10 text-slate-400 uppercase tracking-widest text-[10px]">
                            <tr>
                                <th className="px-6 py-3 font-medium">Name</th>
                                <th className="px-6 py-3 font-medium">Designation</th>
                                <th className="px-6 py-3 font-medium">Status</th>
                                <th className="px-6 py-3 font-medium">Active Projects</th>
                                <th className="px-6 py-3 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
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
                                    <tr key={emp.profile?.id || emp.profile?._id || emp.id || emp._id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary overflow-hidden">
                                                    {emp.profile?.avatar_url ? (
                                                        <img
                                                            src={emp.profile.avatar_url.startsWith('http') || emp.profile.avatar_url.startsWith('data:') ? emp.profile.avatar_url : `${API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL}${emp.profile.avatar_url.startsWith('/') ? emp.profile.avatar_url : '/' + emp.profile.avatar_url}`}
                                                            alt=""
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <img
                                                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(emp.profile?.full_name || 'Node')}&background=8B7CFF&color=fff`}
                                                            alt=""
                                                            className="w-full h-full object-cover"
                                                        />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-[var(--text-primary)]">{emp.profile?.full_name || 'Unnamed Employee'}</div>
                                                    <div className="text-xs text-[var(--text-secondary)]">{emp.profile?.specialization || "Engineer Node"}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-300">
                                                {emp.profile?.specialization || "Unassigned"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                Operational
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-[var(--text-secondary)] font-mono font-bold">
                                            {emp.project_count || 0}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button className="text-primary hover:text-primary/80 text-xs font-bold uppercase tracking-widest transition-colors opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">View Profile</button>
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
