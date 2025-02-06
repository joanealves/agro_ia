import { useState } from "react";

export function UserMenu() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="p-2 bg-gray-700 rounded-full">
        👤
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white text-black shadow-lg">
          <ul>
            <li className="p-2 border-b">Email</li>
            <li className="p-2">Notificações</li>
          </ul>
        </div>
      )}
    </div>
  );
}
