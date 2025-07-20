
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Target, Plus, ArrowRight } from "lucide-react";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { PortfolioResults } from "@/components/portfolio/PortfolioResults";
import React from 'react';
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OptimizerTabProps {
  onCreatePortfolio: () => void;
  setActiveTab?: (tab: string) => void;
}

export const OptimizerTab = ({ onCreatePortfolio, setActiveTab }: OptimizerTabProps) => {
  const { portfolioData, optimizationResults, clearResults } = usePortfolio();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Portfolio Optimizer</h2>
        <p className="text-slate-600">Create and manage your portfolio optimizations</p>
      </div>

      {optimizationResults ? (
        <PortfolioResults />
      ) : (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                Portfolio Optimization Tools
                  </CardTitle>
                </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-2 border-blue-200 hover:border-blue-300 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Target className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Efficient Frontier</h3>
                        <p className="text-sm text-gray-600">Modern Portfolio Theory</p>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4">
                      Analyze your portfolio using Efficient Frontier theory to find optimal risk-return combinations.
                    </p>
                                         <Button 
                       onClick={() => setActiveTab?.('efficient-frontier')}
                       className="w-full bg-blue-600 hover:bg-blue-700"
                     >
                       <Target className="w-4 h-4 mr-2" />
                       Go to Efficient Frontier
                       <ArrowRight className="w-4 h-4 ml-2" />
                     </Button>
                  </CardContent>
                </Card>

                <Card className="border-2 border-purple-200 hover:border-purple-300 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Target className="w-5 h-5 text-purple-600" />
                    </div>
                      <div>
                        <h3 className="font-semibold text-lg">Black-Litterman</h3>
                        <p className="text-sm text-gray-600">Advanced Optimization</p>
                    </div>
                    </div>
                    <p className="text-gray-700 mb-4">
                      Incorporate your market views and confidence levels for advanced portfolio optimization.
                    </p>
                  <Button 
                       onClick={() => setActiveTab?.('black-litterman')}
                       className="w-full bg-purple-600 hover:bg-purple-700"
                     >
                       <Target className="w-4 h-4 mr-2" />
                       Go to Black-Litterman
                       <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>

              <div className="text-center pt-4">
                <p className="text-gray-600 mb-4">
                  Choose your preferred optimization method from the navigation menu above
                </p>
                <Button 
                  onClick={onCreatePortfolio}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Portfolio
                </Button>
              </div>
                </CardContent>
              </Card>
            </div>
          )}
    </div>
  );
};
