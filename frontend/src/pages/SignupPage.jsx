import React from 'react';
import Signup from '../components/auth/Signup';
import AuthLayout from '../layouts/AuthLayout';

const SignupPage = () => {
    return (
        <AuthLayout>
            <Signup />
        </AuthLayout>
    );
};

export default SignupPage;
