import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from "recharts";
import { HestonResponse } from "@/services/api";

interface HestonPathsChartProps {
  result: HestonResponse;
  nDays: number;
}

// Generate colors for different paths
const generatePathColors = (numPaths: number): string[] => {
  const colors = [];
  for (let i = 0; i < numPaths; i++) {
    const hue = (i * 137.5) % 360; // Golden angle for good distribution
    const saturation = 60 + (i % 3) * 15; // Vary saturation
    const lightness = 45 + (i % 2) * 10; // Vary lightness
    colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
  }
  return colors;
};

export const HestonPathsChart: React.FC<HestonPathsChartProps> = ({ result, nDays }) => {
  if (!result.portfolio_paths || result.portfolio_paths.length === 0) {
    return (
      <Card className="overflow-hidden bg-gradient-to-br from-white to-slate-50 border-slate-200/60 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-cyan-100/50">
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <div className="w-2 h-6 bg-gradient-to-b from-cyan-500 to-cyan-600 rounded-full"></div>
            Heston Simulated Portfolio Paths
          </CardTitle>
          <CardDescription>
            No path data available for visualization
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-center text-slate-500">Path data not available</p>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for the chart
  const pathData = [];
  const pathLength = result.portfolio_paths[0]?.length || 0;
  
  for (let day = 0; day < pathLength; day++) {
    const dayData: any = { day };
    result.portfolio_paths.forEach((path, pathIndex) => {
      dayData[`path_${pathIndex}`] = path[day];
    });
    pathData.push(dayData);
  }

  const pathColors = generatePathColors(result.portfolio_paths.length);
  
  // Calculate statistics for better visualization
  const allValues = result.portfolio_paths.flat();
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const padding = (maxValue - minValue) * 0.1;
  const yMin = minValue - padding;
  const yMax = maxValue + padding;

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-white to-slate-50 border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-500">
      <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-cyan-100/50">
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <div className="w-2 h-6 bg-gradient-to-b from-cyan-500 to-cyan-600 rounded-full"></div>
          Heston Simulated Portfolio Paths ({nDays} Days)
        </CardTitle>
        <CardDescription>
          {result.portfolio_paths.length} sample paths showing possible portfolio value trajectories using the Heston stochastic volatility model
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
                 <div className="bg-white rounded-lg shadow-sm border p-2 md:p-4">
           <ResponsiveContainer width="100%" height={400}>
             <LineChart data={pathData} margin={{ left: 90, right: 30, top: 20, bottom: 50 }}>
               <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
               <XAxis
                 dataKey="day"
                 tickFormatter={d => `${d}`}
                 label={{ value: "Days", position: "insideBottom", offset: -10 }}
               />
               <YAxis
                 domain={[yMin, yMax]}
                 tickFormatter={v => `$${Math.round(v).toLocaleString()}`}
                 label={{
                   value: "Portfolio Value ($)",
                   angle: -90,
                   position: "insideLeft",
                   offset: -40,
                   style: { textAnchor: 'middle' }
                 }}
                 width={75}
               />
               <Tooltip
                 formatter={(value) => [`$${Math.round(Number(value)).toLocaleString()}`, "Portfolio Value"]}
                 labelFormatter={(day) => `Day ${day}`}
               />
              
              {/* Render all paths */}
              {result.portfolio_paths.map((_, pathIndex) => (
                <Line
                  key={`path_${pathIndex}`}
                  type="monotone"
                  dataKey={`path_${pathIndex}`}
                  stroke={pathColors[pathIndex]}
                  strokeWidth={1.5}
                  dot={false}
                  strokeOpacity={0.7}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        
                 {/* Statistics summary */}
         <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
           <div className="p-3 bg-gray-50 rounded-lg">
             <div className="font-semibold text-gray-700">Sample Paths</div>
             <div className="text-lg font-bold text-gray-800">{result.portfolio_paths.length}</div>
           </div>
           <div className="p-3 bg-blue-50 rounded-lg">
             <div className="font-semibold text-blue-700">Time Horizon</div>
             <div className="text-lg font-bold text-blue-800">{nDays} days</div>
           </div>
           <div className="p-3 bg-black rounded-lg">
             <div className="font-semibold text-white">Initial Value</div>
             <div className="text-lg font-bold text-white">${Math.round(result.initial_value).toLocaleString()}</div>
           </div>
           <div className="p-3 bg-green-50 rounded-lg">
             <div className="font-semibold text-green-700">Highest Path</div>
             <div className="text-lg font-bold text-green-800">${Math.round(maxValue).toLocaleString()}</div>
           </div>
           <div className="p-3 bg-red-50 rounded-lg">
             <div className="font-semibold text-red-700">Lowest Path</div>
             <div className="text-lg font-bold text-red-800">${Math.round(minValue).toLocaleString()}</div>
           </div>
         </div>
        
        {/* Path interpretation */}
        <div className="mt-4 p-4 bg-slate-50 rounded-lg">
          <h4 className="font-semibold text-slate-800 mb-2">Path Interpretation</h4>
          <p className="text-sm text-slate-600">
            Each colored line represents a possible future trajectory of your portfolio value using the Heston stochastic volatility model. 
            The wide spread of paths illustrates the uncertainty in future portfolio performance. Paths that diverge significantly from 
            the initial value highlight the impact of volatility clustering and market stress scenarios captured by the Heston model.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}; 