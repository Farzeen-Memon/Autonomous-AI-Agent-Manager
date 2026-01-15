import React from 'react';
import Header from '../components/common/Header';

const EmployeeLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
                {children}
            </main>
        </div>
    );
};

export default EmployeeLayout;
