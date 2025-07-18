import { HestonSimulatorTab } from "./HestonSimulatorTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MonteCarloTab } from "../portfolio/MonteCarloTab";

interface SimulatorTabProps {
  onCreatePortfolio: () => void;
}

export const SimulatorTab = ({ onCreatePortfolio }: SimulatorTabProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Portfolio Simulators</h2>
        <p className="text-lg text-slate-600">Advanced risk analysis and forecasting tools</p>
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
