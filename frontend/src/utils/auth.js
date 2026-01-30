export const logout = (navigate) => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    if (navigate) {
        navigate('/login');
    } else {
        window.location.href = '/login';
    }
};
