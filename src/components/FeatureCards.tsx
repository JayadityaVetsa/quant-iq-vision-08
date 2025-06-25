
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
    <div className="grid md:grid-cols-3 gap-6">
      {features.map((feature) => {
        const Icon = feature.icon;
        return (
          <Card key={feature.id} className={`hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-${feature.color}-500`}>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 bg-${feature.color}-100 rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 text-${feature.color}-600`} />
                </div>
                <div>
                  <CardTitle className="text-slate-800">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">
                {feature.content}
              </p>
              <Button 
                variant="outline" 
                onClick={() => setActiveTab(feature.id)}
                className="w-full"
              >
                {feature.buttonText}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
