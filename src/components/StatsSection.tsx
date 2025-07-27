import { TrendingUp, Users, DollarSign, Award } from "lucide-react";

export const StatsSection = () => {
  const stats = [
    {
      icon: DollarSign,
      value: "$2.5B+",
      label: "Assets Under Management",
      description: "Institutional capital optimized"
    },
    {
      icon: Users,
      value: "500+",
      label: "Active Institutions",
      description: "Hedge funds, banks, and wealth managers"
    },
    {
      icon: TrendingUp,
      value: "15.2%",
      label: "Average Alpha Generation",
      description: "Outperformance vs benchmarks"
    },
    {
      icon: Award,
      value: "99.9%",
      label: "System Uptime",
      description: "Enterprise-grade reliability"
    }
  ];

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-accent/10 blur-3xl animate-float delay-500" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 animate-slide-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Trusted by <span className="text-gradient">Industry Leaders</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join hundreds of institutional investors who rely on our platform for their most critical investment decisions.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div 
              key={stat.label}
              className={`text-center animate-scale-in delay-${200 + index * 100} group`}
            >
              <div className="card-professional hover:scale-105 transition-all duration-300 hover:shadow-xl">
                <div className="flex flex-col items-center">
                  {/* Icon */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 mb-4 group-hover:from-primary/30 group-hover:to-accent/30 transition-all duration-300">
                    <stat.icon className="w-8 h-8 text-primary group-hover:text-accent transition-colors" />
                  </div>
                  
                  {/* Value */}
                  <div className="text-4xl md:text-5xl font-bold text-gradient mb-2">
                    {stat.value}
                  </div>
                  
                  {/* Label */}
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                    {stat.label}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-sm text-muted-foreground">
                    {stat.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center animate-slide-up delay-600">
          <p className="text-muted-foreground mb-8">Trusted by leading financial institutions worldwide</p>
          <div className="flex justify-center items-center gap-12 opacity-60">
            {["Goldman Sachs", "BlackRock", "JP Morgan", "Vanguard", "Fidelity"].map((company) => (
              <div key={company} className="text-lg font-semibold hover:opacity-100 transition-opacity cursor-pointer">
                {company}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}; 