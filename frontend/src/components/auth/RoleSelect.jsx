import React from 'react';
import Button from '../common/Button';
import Card from '../common/Card';

const RoleSelect = () => {
    return (
        <div className="flex justify-center items-center h-full space-x-4">
            <Card className="text-center p-8 cursor-pointer hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-bold mb-2">Admin</h3>
                <p className="mb-4">Manage workspace and agents</p>
                <Button>Select</Button>
            </Card>
            <Card className="text-center p-8 cursor-pointer hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-bold mb-2">Employee</h3>
                <p className="mb-4">View tasks and profile</p>
                <Button>Select</Button>
            </Card>
        </div>
    );
};

export default RoleSelect;
