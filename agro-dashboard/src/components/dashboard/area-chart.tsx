// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// interface AreaChartCardProps {
//   title: string;
//   data: Array<{
//     date: string;
//     value: number;
//   }>;
//   dataKey: string;
//   gradientFrom: string;
//   gradientTo: string;
// }

// export function AreaChartCard({ title, data, dataKey, gradientFrom, gradientTo }: AreaChartCardProps) {
//   return (
//     <Card className="col-span-4">
//       <CardHeader>
//         <CardTitle>{title}</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <div className="h-[200px]">
//           <ResponsiveContainer width="100%" height="100%">
//             <AreaChart data={data}>
//               <defs>
//                 <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
//                   <stop offset="0%" stopColor={gradientFrom} stopOpacity={0.5} />
//                   <stop offset="100%" stopColor={gradientTo} stopOpacity={0} />
//                 </linearGradient>
//               </defs>
//               <XAxis 
//                 dataKey="date" 
//                 stroke="#888888"
//                 fontSize={12}
//                 tickLine={false}
//                 axisLine={false}
//               />
//               <YAxis
//                 stroke="#888888"
//                 fontSize={12}
//                 tickLine={false}
//                 axisLine={false}
//                 tickFormatter={(value) => `${value}`}
//               />
//               <Tooltip />
//               <Area
//                 type="monotone"
//                 dataKey={dataKey}
//                 stroke={gradientFrom}
//                 fill={`url(#gradient-${dataKey})`}
//               />
//             </AreaChart>
//           </ResponsiveContainer>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }









"use client";

// =============================================================================
// AREA CHART - Gráfico de área
// =============================================================================

import {
  Area,
  AreaChart as RechartsAreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

// =============================================================================
// TYPES
// =============================================================================

interface AreaChartData {
  date: string;
  value: number;
  [key: string]: string | number;
}

interface AreaChartCardProps {
  title: string;
  data: AreaChartData[];
  dataKey?: string;
  xAxisKey?: string;
  gradientFrom?: string;
  gradientTo?: string;
  height?: number;
}

// =============================================================================
// AREA CHART COMPONENT
// =============================================================================

export function AreaChartCard({
  title,
  data,
  dataKey = "value",
  xAxisKey = "date",
  gradientFrom = "hsl(var(--primary))",
  gradientTo = "hsl(var(--primary))",
  height = 200,
}: AreaChartCardProps) {
  const gradientId = `gradient-${dataKey}-${Math.random().toString(36).slice(2)}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <RechartsAreaChart data={data}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={gradientFrom} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={gradientTo} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey={xAxisKey}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={gradientFrom}
                fill={`url(#${gradientId})`}
                strokeWidth={2}
              />
            </RechartsAreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// Export default para compatibilidade
export default AreaChartCard;