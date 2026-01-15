import React from 'react';

const Header = () => {
  return (
    <header className="bg-white shadow p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-gray-800">Nexo</h1>
      <div className="flex items-center space-x-4">
        <span>User Profile</span>
      </div>
    </header>
  );
};

export default Header;
