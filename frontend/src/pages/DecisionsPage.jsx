
import React from 'react';
import AdminLayout from '../layouts/AdminLayout';
import AgentDecisions from '../components/admin/AgentDecisions';

const DecisionsPage = () => {
    return (
        <AdminLayout title="Agent Logic">
            <AgentDecisions />
        </AdminLayout>
    );
};

export default DecisionsPage;
