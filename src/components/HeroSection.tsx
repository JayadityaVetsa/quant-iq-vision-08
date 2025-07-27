import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Shield, BarChart3 } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-primary/15 blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-accent/15 blur-3xl animate-float delay-300" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-r from-primary/10 to-accent/10 blur-3xl animate-glow" />
      </div>

      <div className="relative z-10 text-center max-w-6xl mx-auto">
        {/* Main Headline */}
        <div className="animate-slide-up">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight">
            <span className="text-gradient">Institutional-Grade</span>
            <br />
            <span className="text-foreground">Portfolio Optimization</span>
          </h1>
        </div>

        {/* Subtitle */}
        <div className="animate-slide-up delay-200">
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto leading-relaxed">
            Leverage cutting-edge quantitative models, Monte Carlo simulations, and modern portfolio theory 
            to make data-driven investment decisions with institutional-grade analytics.
          </p>
        </div>

        {/* User Types */}
        <div className="animate-slide-up delay-300">
          <div className="flex justify-center items-center gap-4 flex-wrap mb-12">
            {["Institutional Investors", "Quantitative Analysts", "Portfolio Managers"].map((type, index) => (
              <Button
                key={type}
                variant="professional"
                className={`animate-scale-in delay-${400 + index * 100}`}
              >
                {type}
              </Button>
            ))}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="animate-slide-up delay-500">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button variant="hero" size="lg" className="group">
              Start Analysis
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="ghost" size="lg" className="text-muted-foreground hover:text-foreground">
              View Demo
            </Button>
          </div>
        </div>

        {/* Feature Icons */}
        <div className="animate-slide-up delay-600">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: TrendingUp, title: "Advanced Analytics", desc: "Real-time portfolio optimization" },
              { icon: Shield, title: "Risk Management", desc: "Institutional-grade security" },
              { icon: BarChart3, title: "Performance Tracking", desc: "Comprehensive reporting" }
            ].map((feature, index) => (
              <div key={feature.title} className={`animate-scale-in delay-${700 + index * 100}`}>
                <div className="card-professional text-center group hover:scale-105 transition-transform duration-300">
                  <feature.icon className="w-12 h-12 mx-auto mb-4 text-primary group-hover:text-accent transition-colors" />
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}; 