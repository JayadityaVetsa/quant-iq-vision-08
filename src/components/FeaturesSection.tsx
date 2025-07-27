import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Calculator, 
  LineChart, 
  PieChart, 
  Shield, 
  Zap,
  Target,
  TrendingDown,
  BarChart4
} from "lucide-react";

export const FeaturesSection = () => {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analytics",
      description: "Machine learning algorithms analyze market patterns and optimize portfolio allocation in real-time.",
      badge: "Advanced AI"
    },
    {
      icon: Calculator,
      title: "Monte Carlo Simulations",
      description: "Run thousands of scenarios to understand potential outcomes and risk exposure.",
      badge: "Quantitative"
    },
    {
      icon: LineChart,
      title: "Modern Portfolio Theory",
      description: "Markowitz optimization with advanced constraints and multi-factor models.",
      badge: "MPT"
    },
    {
      icon: PieChart,
      title: "Asset Allocation",
      description: "Dynamic rebalancing with tax-loss harvesting and transaction cost optimization.",
      badge: "Optimization"
    },
    {
      icon: Shield,
      title: "Risk Management",
      description: "VaR, CVaR, and stress testing with regulatory compliance frameworks.",
      badge: "Risk Control"
    },
    {
      icon: Zap,
      title: "Real-Time Execution",
      description: "Direct market access with smart order routing and execution algorithms.",
      badge: "Live Trading"
    },
    {
      icon: Target,
      title: "Performance Attribution",
      description: "Granular analysis of returns, tracking error, and benchmark comparison.",
      badge: "Analytics"
    },
    {
      icon: TrendingDown,
      title: "Downside Protection",
      description: "Tail risk hedging strategies and downside deviation minimization.",
      badge: "Protection"
    },
    {
      icon: BarChart4,
      title: "Custom Reporting",
      description: "Institutional-grade reports with client-specific metrics and branding.",
      badge: "Reporting"
    }
  ];

  return (
    <section className="py-24 px-4 relative">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 animate-slide-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-gradient">Professional-Grade</span> Features
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need for sophisticated portfolio management and quantitative analysis.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className={`animate-scale-in delay-${100 + index * 50} group`}
            >
              <Card className="card-professional h-full hover:scale-105 transition-all duration-300 border-border/50 hover:border-primary/30">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 group-hover:from-primary/30 group-hover:to-accent/30 transition-all duration-300">
                      <feature.icon className="w-6 h-6 text-primary group-hover:text-accent transition-colors" />
                    </div>
                    <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                      {feature.badge}
                    </Badge>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-gradient transition-all duration-300">
                    {feature.title}
                  </h3>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}; 