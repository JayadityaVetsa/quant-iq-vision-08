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
    <Card className="bg-white/60 backdrop-blur-lg border border-slate-200/60 rounded-2xl shadow-2xl animate-fadein-up" style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.10)' }}>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-slate-900 tracking-tight">Portfolio Metrics</CardTitle>
        <CardDescription className="text-base text-slate-500">Key performance indicators for your portfolio analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center p-5 bg-white/80 rounded-xl hover:bg-slate-100/80 shadow group transition-all duration-300 animate-fadein-up"
                style={{ animationDelay: `${index * 0.07}s` }}
              >
                <div className={`w-14 h-14 ${metric.bgColor} rounded-full flex items-center justify-center mb-4 shadow group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-7 h-7 ${metric.color}`} />
                </div>
                <h4 className="font-medium text-slate-900 text-base mb-1 tracking-tight">{metric.title}</h4>
                <p className="text-sm text-slate-600">{metric.value}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
