import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export const WelcomeSection = () => {

  const userTypes = ["Institutional Investors", "Quantitative Analysts", "Portfolio Managers"];

  return (
    <div className="text-center py-16 md:py-24 space-y-6 relative overflow-hidden animate-fade-in">
      <h1 
        className="text-4xl md:text-5xl font-bold text-gray-700 animate-fade-in-down"
        style={{ animationDelay: '0.2s' }}
      >
        Welcome to
      </h1>
      
      <div 
        className="w-24 h-1 bg-gradient-to-r from-green-400 to-blue-500 mx-auto rounded-full animate-scale-in"
        style={{ animationDelay: '0.4s' }}
      />

      <h2 
        className="text-2xl md:text-4xl font-semibold text-gray-800 max-w-4xl mx-auto animate-fade-in-down"
        style={{ animationDelay: '0.6s' }}
      >
        Professional portfolio optimization and quantitative risk analysis for
      </h2>
      
      <div 
        className="flex justify-center items-center gap-4 flex-wrap animate-fade-in-up"
        style={{ animationDelay: '0.8s' }}
      >
        {userTypes.map((type, index) => (
          <Button
            key={type}
            variant="outline"
            className="rounded-full text-gray-700 bg-white/50 border-gray-200 hover:bg-white hover:border-gray-400 transition-all duration-300 animate-fade-in-up"
            style={{ animationDelay: `${0.9 + index * 0.1}s` }}
          >
            {type}
          </Button>
        ))}
      </div>

      <p 
        className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed animate-fade-in-up"
        style={{ animationDelay: '1.2s' }}
      >
        Leverage cutting-edge quantitative models, Monte Carlo simulations, and modern portfolio theory 
        to make data-driven investment decisions with institutional-grade analytics.
      </p>

      <div 
        className="animate-fade-in-up"
        style={{ animationDelay: '1.4s' }}
      >
        <Button size="lg" className="rounded-full bg-gradient-to-r from-green-500 to-blue-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
          <CheckCircle className="w-5 h-5 mr-2" />
          Ready for institutional-grade portfolio analysis?
        </Button>
      </div>
    </div>
  );
};
