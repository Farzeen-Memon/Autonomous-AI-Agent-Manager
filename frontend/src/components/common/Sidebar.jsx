import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
    return (
        <aside className="w-64 bg-gray-900 text-white h-screen p-4 flex flex-col">
            <div className="mb-8">
                <h2 className="text-2xl font-bold">Nexo</h2>
            </div>
            <nav className="flex-1">
                <ul className="space-y-2">
                    <li>
                        <Link to="/admin" className="block p-2 hover:bg-gray-800 rounded">Admin Dashboard</Link>
                    </li>
                    <li>
                        <Link to="/employee" className="block p-2 hover:bg-gray-800 rounded">Employee Dashboard</Link>
                    </li>
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;
