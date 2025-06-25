
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BarChart3, Plus } from "lucide-react";

interface SimulatorTabProps {
  onCreatePortfolio: () => void;
}

export const SimulatorTab = ({ onCreatePortfolio }: SimulatorTabProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Monte Carlo Simulator</h2>
        <p className="text-slate-600">Forecast potential portfolio outcomes with 10,000 simulations</p>
      </div>
      <Card className="p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-xl font-semibold text-slate-800 mb-2">Cone of Possibility</h3>
        <p className="text-slate-600 mb-6">
          Visualize how risk accumulates over time and see the range of potential future outcomes for your portfolio.
        </p>
        <Button 
          onClick={onCreatePortfolio}
          className="bg-red-600 hover:bg-red-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Portfolio
        </Button>
      </Card>
    </div>
  );
};
