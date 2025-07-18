
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { OptimizationResults } from "@/contexts/PortfolioContext";

interface MetricsTableProps {
  results: OptimizationResults;
}

export const MetricsTable = ({ results }: MetricsTableProps) => {
  const formatPercentage = (value: number) => `${(value * 100).toFixed(2)}%`;
  const formatNumber = (value: number) => value.toFixed(3);
  const formatRiskIndex = (value: number) => value.toFixed(1);

  // Always use the keys 'S&P 500 (SPY)' and the sector ETF ending with ' (Sector)'
  const sectorETFKey = Object.keys(results.benchmarkResults).find(
    (name) => name.endsWith(' (Sector)')
  );
  const spyKey = 'S&P 500 (SPY)';

  const tableData = [
    {
      name: "Your Portfolio",
      metrics: results.currentPortfolio
    },
    {
      name: "Max Sharpe Portfolio",
      metrics: results.maxSharpePortfolio
    },
    {
      name: "Min Volatility Portfolio",
      metrics: results.minVolatilityPortfolio
    },
    spyKey ? {
      name: spyKey,
      metrics: results.benchmarkResults[spyKey] || {}
    } : null,
    sectorETFKey ? {
      name: sectorETFKey,
      metrics: results.benchmarkResults[sectorETFKey] || {}
    } : null
  ].filter(Boolean);

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-white to-slate-50 border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-500">
      <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100/50">
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <div className="w-2 h-6 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-full"></div>
          Detailed Performance Metrics
        </CardTitle>
        <CardDescription>
          Comprehensive comparison of risk and return metrics across all portfolios and benchmarks
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="overflow-x-auto rounded-lg border border-slate-200/60 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                <TableHead className="font-bold text-slate-700 py-4">Portfolio</TableHead>
                <TableHead className="text-right font-bold text-slate-700">Annual Return</TableHead>
                <TableHead className="text-right font-bold text-slate-700">Volatility</TableHead>
                <TableHead className="text-right font-bold text-slate-700">Sharpe Ratio</TableHead>
                <TableHead className="text-right font-bold text-slate-700">Sortino Ratio</TableHead>
                <TableHead className="text-right font-bold text-slate-700">Max Drawdown</TableHead>
                <TableHead className="text-right font-bold text-slate-700">Risk Index</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((row, index) => (
                <TableRow key={row.name} className={`hover:bg-slate-50/80 transition-colors duration-200 ${
                  index === 0 ? 'bg-blue-50/30 border-blue-100' : 
                  index === 1 ? 'bg-green-50/30 border-green-100' :
                  index === 2 ? 'bg-purple-50/30 border-purple-100' : ''
                }`}>
                  <TableCell className="font-semibold text-slate-700 py-4">
                    {index === 0 && <span className="inline-block w-2 h-4 bg-blue-500 rounded-full mr-2"></span>}
                    {index === 1 && <span className="inline-block w-2 h-4 bg-green-500 rounded-full mr-2"></span>}
                    {index === 2 && <span className="inline-block w-2 h-4 bg-purple-500 rounded-full mr-2"></span>}
                    {row.name}
                  </TableCell>
                  <TableCell className="text-right font-medium text-slate-600">
                    <span className="inline-flex items-center px-2 py-1 rounded bg-green-50 text-green-700 text-sm font-semibold">
                      {formatPercentage(row.metrics?.return ?? 0)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium text-slate-600">
                    <span className="inline-flex items-center px-2 py-1 rounded bg-orange-50 text-orange-700 text-sm font-semibold">
                      {formatPercentage(row.metrics?.volatility ?? 0)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium text-slate-600">
                    <span className="inline-flex items-center px-2 py-1 rounded bg-blue-50 text-blue-700 text-sm font-semibold">
                      {formatNumber(row.metrics?.sharpe ?? 0)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium text-slate-600">
                    <span className="inline-flex items-center px-2 py-1 rounded bg-purple-50 text-purple-700 text-sm font-semibold">
                      {formatNumber(row.metrics?.sortino ?? 0)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium text-slate-600">
                    <span className="inline-flex items-center px-2 py-1 rounded bg-red-50 text-red-700 text-sm font-semibold">
                      {formatPercentage(row.metrics?.maxDrawdown ?? 0)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-bold border-2 ${
                      (row.metrics?.riskIndex ?? 0) >= 70 ? "bg-green-100 text-green-700 border-green-200" :
                      (row.metrics?.riskIndex ?? 0) >= 40 ? "bg-yellow-100 text-yellow-700 border-yellow-200" : "bg-red-100 text-red-700 border-red-200"
                    }`}>
                      {formatRiskIndex(row.metrics?.riskIndex ?? 0)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="mt-6 p-6 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200/60 shadow-sm">
          <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <div className="w-1.5 h-5 bg-gradient-to-b from-slate-500 to-slate-600 rounded-full"></div>
            Metric Definitions
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-white rounded-lg shadow-sm border border-slate-200/50">
              <strong className="text-green-700 flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Annual Return:
              </strong> 
              <span className="text-slate-600">Expected yearly return</span>
            </div>
            <div className="p-3 bg-white rounded-lg shadow-sm border border-slate-200/50">
              <strong className="text-orange-700 flex items-center gap-1">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Volatility:
              </strong> 
              <span className="text-slate-600">Standard deviation of returns</span>
            </div>
            <div className="p-3 bg-white rounded-lg shadow-sm border border-slate-200/50">
              <strong className="text-blue-700 flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Sharpe Ratio:
              </strong> 
              <span className="text-slate-600">Risk-adjusted return measure</span>
            </div>
            <div className="p-3 bg-white rounded-lg shadow-sm border border-slate-200/50">
              <strong className="text-purple-700 flex items-center gap-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Sortino Ratio:
              </strong> 
              <span className="text-slate-600">Downside risk-adjusted return</span>
            </div>
            <div className="p-3 bg-white rounded-lg shadow-sm border border-slate-200/50">
              <strong className="text-red-700 flex items-center gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                Max Drawdown:
              </strong> 
              <span className="text-slate-600">Largest peak-to-trough decline</span>
            </div>
            <div className="p-3 bg-white rounded-lg shadow-sm border border-slate-200/50">
              <strong className="text-slate-700 flex items-center gap-1">
                <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                Risk Index:
              </strong> 
              <span className="text-slate-600">Composite risk score (0-100, higher is better)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
