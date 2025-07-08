import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, TrendingUp, BarChart3 } from "lucide-react";

interface FeatureCardsProps {
  setActiveTab: (tab: string) => void;
}

export const FeatureCards = ({ setActiveTab }: FeatureCardsProps) => {
  const features = [
    {
      id: "optimizer",
      title: "Portfolio Optimizer",
      description: "Modern Portfolio Theory analysis",
      content: "Analyze your current portfolio and discover optimized alternatives using MPT. Compare against crowd wisdom benchmarks.",
      icon: Target,
      color: "blue",
      buttonText: "Optimize Portfolio"
    },
    {
      id: "analyzer",
      title: "Stock Analyzer",
      description: "Technical & statistical insights",
      content: "Deep dive into individual stocks with technical indicators, distribution analysis, and ELI18 educational mode.",
      icon: TrendingUp,
      color: "green",
      buttonText: "Analyze Stocks"
    },
    {
      id: "simulator",
      title: "Monte Carlo Simulator",
      description: "Future outcome forecasting",
      content: "Run 10,000 simulations to visualize the \"Cone of Possibility\" and understand potential future portfolio outcomes.",
      icon: BarChart3,
      color: "red",
      buttonText: "Run Simulation"
    }
  ];

  return (
    <div className="grid md:grid-cols-3 gap-8">
      {features.map((feature) => {
        const Icon = feature.icon;
        const isMonteCarlo = feature.id === "simulator";
        return (
          <Card
            key={feature.id}
            className={`bg-white/60 backdrop-blur-lg border border-slate-200/60 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.03] transition-all duration-400 group overflow-hidden relative`}
            style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.10)' }}
          >
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 bg-${feature.color}-100 rounded-xl flex items-center justify-center shadow group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-6 h-6 text-${feature.color}-600`} />
                </div>
                <div>
                  <CardTitle className={`${isMonteCarlo ? 'text-sm md:text-base' : 'text-lg'} font-semibold text-slate-900 tracking-tight mb-1 leading-tight`}>{feature.title}</CardTitle>
                  <CardDescription className="text-base text-slate-500 leading-snug mb-2">{feature.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 mb-6 text-base leading-relaxed min-h-[56px]">{feature.content}</p>
              <Button
                variant="outline"
                onClick={() => setActiveTab(feature.id)}
                className="w-full rounded-full font-semibold text-base py-2 bg-white/80 hover:bg-blue-50/80 transition-all duration-300 shadow"
              >
                {feature.buttonText}
              </Button>
            </CardContent>
            <div className={`absolute inset-0 pointer-events-none rounded-2xl border-2 border-transparent group-hover:border-${feature.color}-300 transition-all duration-300`}></div>
          </Card>
        );
      })}
    </div>
  );
};
