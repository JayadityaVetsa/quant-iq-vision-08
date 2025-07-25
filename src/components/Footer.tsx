import { TrendingUp } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="glass border-t border-border/40 mt-16 animate-fade-in-up">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          {/* Logo and Copyright */}
          <div className="flex items-center space-x-3 animate-slide-in-right">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center shadow-lg hover-glow transition-all duration-300">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">© 2024 QuantifyIQ</span>
              <span className="block md:inline md:ml-2">All rights reserved.</span>
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center space-x-8 animate-slide-in-left">
            {[
              { label: "About", href: "#" },
              { label: "Contact", href: "#" },
              { label: "Privacy", href: "#" }
            ].map((link, index) => (
              <a 
                key={link.label}
                href={link.href} 
                className="text-sm text-muted-foreground hover:text-primary transition-all duration-300 hover-scale relative group animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-purple-600 transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 pt-6 border-t border-border/40 animate-fade-in animate-delay-300">
          <div className="glass p-4 rounded-xl">
            <p className="text-xs text-muted-foreground text-center max-w-4xl mx-auto leading-relaxed">
              <span className="font-semibold text-foreground">⚠️ Educational Disclaimer:</span> QuantifyIQ is an educational platform for portfolio analysis and optimization. 
              All calculations, recommendations, and analysis are provided for informational and educational purposes only. 
              This is not financial advice and should not be considered as such. Past performance does not guarantee future results. 
              Always consult with a qualified financial advisor before making investment decisions. 
              <span className="font-semibold text-primary">Invest responsibly.</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}; 