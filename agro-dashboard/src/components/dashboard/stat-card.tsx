// import React from 'react';

// // Definindo as props do componente StatCard
// interface StatCardProps {
//   title: string;
//   value: string | number;
//   icon: React.ElementType; // Aceita um componente de ícone
//   trend?: { value: number; isPositive: boolean }; // Opcional
//   description: string;
//   className?: string; // Adicionando a propriedade className
// }

// // Componente StatCard
// const StatCard: React.FC<StatCardProps> = ({
//   title,
//   value,
//   icon: Icon,
//   trend,
//   description,
//   className,
// }) => {
//   return (
//     <div className={`p-6 rounded-lg shadow-md ${className}`}>
//       <div className="flex items-center gap-2">
//         <Icon className="w-6 h-6" /> {/* Renderiza o ícone */}
//         <h3 className="text-lg font-semibold">{title}</h3>
//       </div>
//       <p className="text-2xl font-bold mt-2">{value}</p>
//       {trend && (
//         <p className={`text-sm ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
//           {trend.isPositive ? '+' : '-'}{trend.value}%
//         </p>
//       )}
//       <p className="text-sm text-gray-500 mt-2">{description}</p>
//     </div>
//   );
// };

// export default StatCard;














// =============================================================================
// STAT CARD - Card de estatísticas do dashboard
// =============================================================================

import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { cn } from "../../lib/utils";

// =============================================================================
// TYPES
// =============================================================================

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

// =============================================================================
// STAT CARD COMPONENT
// =============================================================================

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || trend) && (
          <div className="flex items-center gap-2 mt-1">
            {trend && (
              <span
                className={cn(
                  "text-xs font-medium",
                  trend.isPositive ? "text-green-600" : "text-red-600"
                )}
              >
                {trend.isPositive ? "+" : "-"}
                {Math.abs(trend.value)}%
              </span>
            )}
            {description && (
              <span className="text-xs text-muted-foreground">{description}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Export default para compatibilidade
export default StatCard;