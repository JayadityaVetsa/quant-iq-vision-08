
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RiskGaugeProps {
  riskIndex: number;
  title: string;
}

export const RiskGauge = ({ riskIndex, title }: RiskGaugeProps) => {
  const getColor = (value: number) => {
    if (value >= 70) return "text-green-600";
    if (value >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getBackgroundColor = (value: number) => {
    if (value >= 70) return "bg-green-100";
    if (value >= 40) return "bg-yellow-100";
    return "bg-red-100";
  };

  const getRiskLevel = (value: number) => {
    if (value >= 70) return "Low Risk";
    if (value >= 40) return "Medium Risk";
    return "High Risk";
  };

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-white to-slate-50 border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-500">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100/50">
        <CardTitle className="text-center flex items-center justify-center gap-2 text-slate-800">
          <div className="w-2 h-6 bg-gradient-to-b from-indigo-500 to-indigo-600 rounded-full"></div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center p-6">
        <div className={`w-36 h-36 rounded-full ${getBackgroundColor(riskIndex)} flex items-center justify-center mx-auto mb-6 shadow-lg border-4 border-white relative overflow-hidden group hover:scale-105 transition-all duration-500`}>
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full"></div>
          <div className="text-center relative z-10">
            <div className={`text-4xl font-bold ${getColor(riskIndex)} transition-all duration-300 group-hover:scale-110`}>
              {riskIndex.toFixed(0)}
            </div>
            <div className="text-sm text-slate-600 font-medium">/ 100</div>
          </div>
        </div>
        <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-semibold ${getColor(riskIndex)} ${getBackgroundColor(riskIndex)} border-2 border-white shadow-sm mb-4`}>
          {getRiskLevel(riskIndex)}
        </div>
        <p className="text-sm text-slate-600 mb-6 max-w-xs mx-auto">
          Higher scores indicate better risk-adjusted performance
        </p>
        
        {/* Enhanced Risk Index Bar */}
        <div className="mt-4">
          <div className="w-full bg-gradient-to-r from-slate-200 to-slate-300 rounded-full h-4 shadow-inner border border-slate-300/50">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${
                riskIndex >= 70 ? 'bg-gradient-to-r from-green-400 to-green-600' : 
                riskIndex >= 40 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : 'bg-gradient-to-r from-red-400 to-red-600'
              }`}
              style={{ 
                width: `${Math.min(riskIndex, 100)}%`,
                boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3), 0 1px 2px rgba(0,0,0,0.1)'
              }}
            />
          </div>
          <div className="flex justify-between text-xs font-medium text-slate-500 mt-2">
            <span className="bg-white px-2 py-1 rounded shadow-sm border">0</span>
            <span className="bg-white px-2 py-1 rounded shadow-sm border">40</span>
            <span className="bg-white px-2 py-1 rounded shadow-sm border">70</span>
            <span className="bg-white px-2 py-1 rounded shadow-sm border">100</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
