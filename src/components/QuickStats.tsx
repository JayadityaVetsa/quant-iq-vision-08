
import { Card, CardContent } from "@/components/ui/card";
import { Users, BookOpen, Zap } from "lucide-react";

export const QuickStats = () => {
  const stats = [
    {
      icon: Users,
      label: "Early Investors",
      description: "Built for retail traders and students",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      icon: BookOpen,
      label: "Educational Focus",
      description: "ELI18 mode for learning",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      icon: Zap,
      label: "Real Quant Rigor",
      description: "Modern Portfolio Theory & Monte Carlo",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="text-center hover:shadow-md transition-shadow duration-300">
            <CardContent className="pt-6">
              <div className={`w-16 h-16 ${stat.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <Icon className={`w-8 h-8 ${stat.color}`} />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">{stat.label}</h3>
              <p className="text-sm text-slate-600">{stat.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
