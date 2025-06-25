
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Target, Plus } from "lucide-react";

interface OptimizerTabProps {
  onCreatePortfolio: () => void;
}

export const OptimizerTab = ({ onCreatePortfolio }: OptimizerTabProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Portfolio Optimizer</h2>
        <p className="text-slate-600">Analyze and optimize your portfolio using Modern Portfolio Theory</p>
      </div>
      <Card className="p-8 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Target className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-slate-800 mb-2">Create Your Portfolio</h3>
        <p className="text-slate-600 mb-6">
          Enter your stock positions manually to get started with optimization analysis.
        </p>
        <Button 
          onClick={onCreatePortfolio}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Portfolio
        </Button>
      </Card>
    </div>
  );
};
