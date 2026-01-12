// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

// interface BarChartCardProps {
//   title: string;
//   data: Array<{
//     name: string;
//     total: number;
//   }>;
// }

// export function BarChartCard({ title, data }: BarChartCardProps) {
//   return (
//     <Card className="col-span-4">
//       <CardHeader>
//         <CardTitle>{title}</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <div className="h-[200px]">
//           <ResponsiveContainer width="100%" height="100%">
//             <BarChart data={data}>
//               <XAxis
//                 dataKey="name"
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
//               <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }









"use client";

// =============================================================================
// BAR CHART - Gráfico de barras
// =============================================================================

import {
  Bar,
  BarChart as RechartsBarChart,
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

interface BarChartData {
  name: string;
  total: number;
  [key: string]: string | number;
}

interface BarChartCardProps {
  title: string;
  data: BarChartData[];
  dataKey?: string;
  xAxisKey?: string;
  color?: string;
  height?: number;
}

// =============================================================================
// BAR CHART COMPONENT
// =============================================================================

export function BarChartCard({
  title,
  data,
  dataKey = "total",
  xAxisKey = "name",
  color = "hsl(var(--primary))",
  height = 200,
}: BarChartCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart data={data}>
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
                cursor={{ fill: "hsl(var(--accent))" }}
              />
              <Bar
                dataKey={dataKey}
                fill={color}
                radius={[4, 4, 0, 0]}
              />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// Export default para compatibilidade
export default BarChartCard;