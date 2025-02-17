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