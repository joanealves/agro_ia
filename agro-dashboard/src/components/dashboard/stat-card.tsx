import React from 'react';

// Definindo as props do componente StatCard
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType; // Aceita um componente de ícone
  trend?: { value: number; isPositive: boolean }; // Opcional
  description: string;
  className?: string; // Adicionando a propriedade className
}

// Componente StatCard
const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  description,
  className,
}) => {
  return (
    <div className={`p-6 rounded-lg shadow-md ${className}`}>
      <div className="flex items-center gap-2">
        <Icon className="w-6 h-6" /> {/* Renderiza o ícone */}
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <p className="text-2xl font-bold mt-2">{value}</p>
      {trend && (
        <p className={`text-sm ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {trend.isPositive ? '+' : '-'}{trend.value}%
        </p>
      )}
      <p className="text-sm text-gray-500 mt-2">{description}</p>
    </div>
  );
};

export default StatCard;