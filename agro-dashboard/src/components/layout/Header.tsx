import { User } from '@/lib/auth';

interface HeaderProps {
  onMenuClick: () => void;
  user: User;
}

export function Header({ onMenuClick, user }: HeaderProps) {
  return (
    <header className="p-4 bg-gray-800 text-white flex justify-between items-center">
      <button onClick={onMenuClick} className="md:hidden text-white">
        ☰
      </button>
      <h1 className="text-xl font-bold">Meu Dashboard</h1>
      {user && <span>Bem-vindo, {user.name}</span>}
    </header>
  );
}
