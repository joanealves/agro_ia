import Link from "next/link";

const menuItems = ["Pragas", "Relatórios", "Mapas", "Fazendas", "Irrigações", "Notificações"];

export function Sidebar() {
  return (
    <aside className="w-64 bg-gray-800 p-4">
      <nav>
        <ul>
          {menuItems.map((item) => (
            <li key={item} className="mb-4">
              <Link href={`/${item.toLowerCase()}`} className="text-white hover:text-gray-400">
                {item}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}