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
    <div className="grid md:grid-cols-3 gap-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className="bg-white/60 backdrop-blur-lg border border-slate-200/60 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.03] transition-all duration-400 group animate-fadein-up"
            style={{ animationDelay: `${index * 0.08}s`, boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.10)' }}
          >
            <CardContent className="pt-8 pb-6">
              <div className={`w-16 h-16 ${stat.bgColor} rounded-full flex items-center justify-center mx-auto mb-5 shadow group-hover:scale-110 transition-transform duration-300`}>
                <Icon className={`w-8 h-8 ${stat.color}`} />
              </div>
              <h3 className="font-semibold text-slate-900 text-lg mb-2 tracking-tight">{stat.label}</h3>
              <p className="text-base text-slate-600">{stat.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
