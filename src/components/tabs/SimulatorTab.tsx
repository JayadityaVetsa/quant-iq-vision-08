import { HestonSimulatorTab } from "./HestonSimulatorTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MonteCarloTab } from "../portfolio/MonteCarloTab";
import { usePortfolio } from "@/contexts/PortfolioContext";

interface SimulatorTabProps {
  onCreatePortfolio: () => void;
}

export const SimulatorTab = ({ onCreatePortfolio }: SimulatorTabProps) => {
  const { activePortfolio } = usePortfolio();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">Portfolio Simulators</h2>
        <p className="text-lg text-muted-foreground">Advanced risk analysis and forecasting tools</p>
        {activePortfolio && (
          <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 rounded-full border border-blue-200">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-xs sm:text-sm text-blue-700">
              Using active portfolio: <strong>{activePortfolio.name}</strong>
            </span>
          </div>
        )}
      </div>
      
      <Tabs defaultValue="monte-carlo" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="monte-carlo">Monte Carlo Simulator</TabsTrigger>
          <TabsTrigger value="heston">Heston Simulator</TabsTrigger>
        </TabsList>
        
        <TabsContent value="monte-carlo" className="space-y-6">
          <MonteCarloTab />
        </TabsContent>
        
        <TabsContent value="heston" className="space-y-6">
          <HestonSimulatorTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};
