
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Shield, Target } from "lucide-react";

export const MetricsCard = () => {
  const metrics = [
    {
      title: "Portfolio Return",
      value: "Upload portfolio to see metrics",
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Risk Level",
      value: "Risk analysis pending",
      icon: Shield,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Sharpe Ratio",
      value: "Optimization needed",
      icon: Target,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Max Drawdown",
      value: "Simulation required",
      icon: TrendingDown,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-slate-800">Portfolio Metrics</CardTitle>
        <CardDescription>
          Key performance indicators for your portfolio analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors duration-200"
              >
                <div className={`w-12 h-12 ${metric.bgColor} rounded-full flex items-center justify-center mb-3`}>
                  <Icon className={`w-6 h-6 ${metric.color}`} />
                </div>
                <h4 className="font-medium text-slate-800 text-sm mb-1">{metric.title}</h4>
                <p className="text-xs text-slate-600">{metric.value}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
