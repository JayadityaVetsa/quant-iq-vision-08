import { Sliders, TrendingUp, Target, Brain } from "lucide-react";

interface FeatureCardsProps {
  setActiveTab: (tab: string) => void;
}

export const FeatureCards = ({ setActiveTab }: FeatureCardsProps) => {

  const features = [
    {
      title: "Efficient Frontier",
      description: "Optimize your portfolio using Modern Portfolio Theory.",
      icon: <Target className="w-8 h-8 text-white" />,
      tab: "efficient-frontier",
      gradient: "from-blue-500 to-indigo-600"
    },
    {
      title: "Black-Litterman",
      description: "Incorporate your market views into your portfolio.",
      icon: <Brain className="w-8 h-8 text-white" />,
      tab: "black-litterman",
      gradient: "from-green-500 to-emerald-600"
    },
    {
      title: "Simulator",
      description: "Forecast future outcomes with Monte Carlo simulations.",
      icon: <Sliders className="w-8 h-8 text-white" />,
      tab: "simulator",
      gradient: "from-purple-500 to-violet-600"
    },
    {
      title: "Stress Test",
      description: "See how your portfolio weathers historical crises.",
      icon: <TrendingUp className="w-8 h-8 text-white" />,
      tab: "analyzer",
      gradient: "from-red-500 to-rose-600"
    }
  ];

  return (
    <div className="py-12 md:py-16">
      <h3 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-10">
        Analysis Tools
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature, index) => (
          <div 
            key={feature.title}
            onClick={() => setActiveTab(feature.tab)}
            className={`
              p-6 rounded-2xl shadow-lg hover:shadow-2xl 
              bg-gradient-to-br ${feature.gradient} 
              text-white cursor-pointer
              transform hover:-translate-y-2 transition-all duration-300
              animate-fade-in-up
            `}
            style={{ animationDelay: `${0.2 + index * 0.1}s` }}
          >
            <div className="flex flex-col items-start justify-between h-full">
              <div>
                <div className="p-3 bg-white/20 rounded-full mb-4 w-max">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-bold mb-2">{feature.title}</h4>
                <p className="text-sm text-white/80">{feature.description}</p>
              </div>
              <button className="mt-6 text-sm font-semibold text-white hover:underline">
                Analyze Now &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
