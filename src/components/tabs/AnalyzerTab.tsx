
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TrendingUp, Plus } from "lucide-react";

interface AnalyzerTabProps {
  onCreatePortfolio: () => void;
}

export const AnalyzerTab = ({ onCreatePortfolio }: AnalyzerTabProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Stock Analyzer</h2>
        <p className="text-slate-600">Technical analysis and statistical insights for individual stocks</p>
      </div>
      <Card className="p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-slate-800 mb-2">Select Stocks to Analyze</h3>
        <p className="text-slate-600 mb-6">
          Create your portfolio first, then dive deep into individual stock analysis with technical indicators and ELI18 mode.
        </p>
        <Button 
          onClick={onCreatePortfolio}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Portfolio
        </Button>
      </Card>
    </div>
  );
};
