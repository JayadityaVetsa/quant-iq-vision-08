
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
    ...Object.entries(results.benchmarkResults).map(([name, metrics]) => ({
      name,
      metrics
    }))
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detailed Performance Metrics</CardTitle>
        <CardDescription>
          Comprehensive comparison of risk and return metrics across all portfolios and benchmarks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Portfolio</TableHead>
                <TableHead className="text-right">Annual Return</TableHead>
                <TableHead className="text-right">Volatility</TableHead>
                <TableHead className="text-right">Sharpe Ratio</TableHead>
                <TableHead className="text-right">Sortino Ratio</TableHead>
                <TableHead className="text-right">Max Drawdown</TableHead>
                <TableHead className="text-right">Risk Index</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((row) => (
                <TableRow key={row.name}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell className="text-right">
                    {formatPercentage(row.metrics.return)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatPercentage(row.metrics.volatility)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(row.metrics.sharpe)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(row.metrics.sortino)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatPercentage(row.metrics.maxDrawdown)}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    <span className={
                      row.metrics.riskIndex >= 70 ? "text-green-600" :
                      row.metrics.riskIndex >= 40 ? "text-yellow-600" : "text-red-600"
                    }>
                      {formatRiskIndex(row.metrics.riskIndex)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="mt-4 p-4 bg-slate-50 rounded-lg">
          <h4 className="font-semibold text-slate-800 mb-2">Metric Definitions</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-600">
            <div><strong>Annual Return:</strong> Expected yearly return</div>
            <div><strong>Volatility:</strong> Standard deviation of returns</div>
            <div><strong>Sharpe Ratio:</strong> Risk-adjusted return measure</div>
            <div><strong>Sortino Ratio:</strong> Downside risk-adjusted return</div>
            <div><strong>Max Drawdown:</strong> Largest peak-to-trough decline</div>
            <div><strong>Risk Index:</strong> Composite risk score (0-100, higher is better)</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
