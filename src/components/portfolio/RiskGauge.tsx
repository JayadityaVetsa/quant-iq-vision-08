
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
    <Card>
      <CardHeader>
        <CardTitle className="text-center">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <div className={`w-32 h-32 rounded-full ${getBackgroundColor(riskIndex)} flex items-center justify-center mx-auto mb-4`}>
          <div className="text-center">
            <div className={`text-3xl font-bold ${getColor(riskIndex)}`}>
              {riskIndex.toFixed(0)}
            </div>
            <div className="text-sm text-slate-600">/ 100</div>
          </div>
        </div>
        <div className={`text-lg font-semibold ${getColor(riskIndex)} mb-2`}>
          {getRiskLevel(riskIndex)}
        </div>
        <p className="text-sm text-slate-600">
          Higher scores indicate better risk-adjusted performance
        </p>
        
        {/* Risk Index Bar */}
        <div className="mt-4">
          <div className="w-full bg-slate-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${
                riskIndex >= 70 ? 'bg-green-500' : 
                riskIndex >= 40 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(riskIndex, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>0</span>
            <span>40</span>
            <span>70</span>
            <span>100</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
