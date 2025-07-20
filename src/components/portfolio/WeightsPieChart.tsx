
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

interface WeightsPieChartProps {
  weights: Record<string, number>;
  title: string;
}

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
  '#82CA9D', '#FFC658', '#FF7C7C', '#8DD1E1', '#D084D0'
];

export const WeightsPieChart = React.memo(({ weights, title }: WeightsPieChartProps) => {
  // Memoize data transformation for better performance
  const data = useMemo(() => {
    return Object.entries(weights)
      .filter(([_, weight]) => weight > 0)
      .map(([ticker, weight]) => ({
        name: ticker,
        value: weight * 100,
        displayValue: `${(weight * 100).toFixed(1)}%`
      }))
      .sort((a, b) => b.value - a.value);
  }, [weights]);

  // Memoize chart configuration
  const chartConfig = useMemo(() => {
    return data.reduce((config, item, index) => {
      config[item.name] = {
        label: item.name,
        color: COLORS[index % COLORS.length]
      };
      return config;
    }, {} as any);
  }, [data]);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-slate-500">No data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-white to-slate-50 border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-cyan-50 to-teal-50 border-b border-cyan-100/50">
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <div className="w-2 h-6 bg-gradient-to-b from-cyan-500 to-cyan-600 rounded-full"></div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                animationDuration={1000}
                animationBegin={0}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => {
                  const item = data.find(d => d.name === value);
                  return `${value}: ${item?.displayValue || ''}`;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
});

WeightsPieChart.displayName = "WeightsPieChart";
