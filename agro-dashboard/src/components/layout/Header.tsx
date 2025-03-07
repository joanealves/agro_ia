import React from 'react';

interface HeaderProps {
  user: {
    name: string;
    username: string;
  };
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onMenuClick }) => {
  return (
    <header className="flex items-center justify-between p-4 bg-primary text-primary-foreground">
      <h1 className="text-xl font-bold">Dashboard</h1>
      <div className="flex items-center">
        <span className="mr-4">Olá, {user.username}</span>
        <button onClick={onMenuClick} className="p-2 bg-secondary rounded">
          Menu
        </button>
      </div>
    </header>
  );
};

export default Header;