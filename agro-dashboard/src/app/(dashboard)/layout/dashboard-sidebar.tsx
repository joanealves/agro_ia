'use client';

import { Home, Map, Cloud, AlertTriangle, BarChart2, Bell } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function DashboardSidebar() {
  const pathname = usePathname();
  
  const menuItems = [
    { title: 'Dashboard', path: '/dashboard', icon: BarChart2 },
    { title: 'Fazendas', path: '/dashboard/fazendas', icon: Home },
    { title: 'Mapas', path: '/dashboard/mapas', icon: Map },
    { title: 'Clima', path: '/dashboard/clima', icon: Cloud },
    { title: 'Pragas', path: '/dashboard/pragas', icon: AlertTriangle },
    { title: 'Notificações', path: '/dashboard/notificacoes', icon: Bell },
  ];

  return (
    <aside className="w-64 bg-card border-r h-full">
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`flex items-center gap-4 px-4 py-2 rounded-md hover:bg-accent
                    ${pathname === item.path ? 'bg-accent' : ''}`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

const Sidebar = () => {
  return (
    <div className="w-64 h-full bg-gray-800 text-white">
      <div className="p-4">
        <h2 className="text-2xl font-bold">Dashboard</h2>
      </div>
      <nav className="mt-4">
        <ul>
          <li>
            <Link href="/dashboard/clima">
              <a className="block p-4 hover:bg-gray-700">Clima</a>
            </Link>
          </li>
          <li>
            <Link href="/dashboard/fazendas">
              <a className="block p-4 hover:bg-gray-700">Fazendas</a>
            </Link>
          </li>
          <li>
            <Link href="/dashboard/irrigacao">
              <a className="block p-4 hover:bg-gray-700">Irrigação</a>
            </Link>
          </li>
          <li>
            <Link href="/dashboard/mapas">
              <a className="block p-4 hover:bg-gray-700">Mapas</a>
            </Link>
          </li>
          <li>
            <Link href="/dashboard/pragas">
              <a className="block p-4 hover:bg-gray-700">Pragas</a>
            </Link>
          </li>
          <li>
            <Link href="/dashboard/produtividade">
              <a className="block p-4 hover:bg-gray-700">Produtividade</a>
            </Link>
          </li>
          <li>
            <Link href="/dashboard/admin">
              <a className="block p-4 hover:bg-gray-700">Admin</a>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;