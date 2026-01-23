import React from 'react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';

const AppLayout = ({ children, title, userRole }) => {
    return (
        <div className="layout-container">
            <Sidebar userRole={userRole} />
            <div className="layout-main">
                <Header title={title} />
                <main className="layout-content">
                    <div className="page-max-container">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AppLayout;
