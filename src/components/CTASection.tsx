import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Shield } from "lucide-react";

export const CTASection = () => {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-accent/15" />
        <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-primary/15 blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-72 h-72 rounded-full bg-accent/15 blur-3xl animate-float delay-300" />
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Main CTA */}
        <div className="animate-slide-up">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Ready to <span className="text-gradient">Optimize</span><br />
            Your Portfolio?
          </h2>
        </div>

        <div className="animate-slide-up delay-200">
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Join the institutional investors who trust our platform with billions in assets. 
            Start your free trial today and experience professional-grade portfolio optimization.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="animate-slide-up delay-300">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button variant="hero" size="lg" className="group">
              <Calendar className="mr-2 w-5 h-5" />
              Start Free Trial
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="professional" size="lg">
              <Shield className="mr-2 w-5 h-5" />
              Request Demo
            </Button>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="animate-slide-up delay-400">
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-accent" />
              <span>Enterprise Security</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-accent" />
              <span>30-Day Free Trial</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-accent" />
              <span>No Setup Fees</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}; 