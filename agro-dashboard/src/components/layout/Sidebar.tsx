"use client";
import { useState } from "react";
import { Home, File, Map, Droplet, Bell, Leaf, Menu, ChevronLeft, ChevronRight } from "lucide-react";

interface SidebarItemProps {
  icon: React.ElementType;
  text: string;
  isOpen: boolean;
}

const SidebarItem = ({ icon: Icon, text, isOpen }: SidebarItemProps) => (
  <div className="flex items-center gap-3 p-3 hover:bg-gray-700 rounded-md cursor-pointer">
    <Icon className="w-5 h-5 text-white" />
    {isOpen && <span className="text-white">{text}</span>}
  </div>
);

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
        className={`bg-gray-900 text-white transition-all duration-300 ${isOpen ? "w-60" : "w-16"} flex flex-col p-2`}
      >
        <button
          className="mb-4 self-start p-2 rounded-md bg-gray-800 hover:bg-gray-700"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <ChevronLeft /> : <ChevronRight />}
        </button>

        {/* Sidebar Items */}
        <SidebarItem icon={Home} text="Pragas" isOpen={isOpen} />
        <SidebarItem icon={File} text="Relatórios" isOpen={isOpen} />
        <SidebarItem icon={Map} text="Mapas" isOpen={isOpen} />
        <SidebarItem icon={Leaf} text="Fazendas" isOpen={isOpen} />
        <SidebarItem icon={Droplet} text="Irrigações" isOpen={isOpen} />
        <SidebarItem icon={Bell} text="Notificações" isOpen={isOpen} />
      </div>
    </div>
  );
};

export default Sidebar;