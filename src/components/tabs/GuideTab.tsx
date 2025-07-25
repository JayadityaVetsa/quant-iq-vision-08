import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  BookOpen, 
  Target, 
  Brain, 
  TrendingUp, 
  BarChart3, 
  Calculator,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  ArrowRight
} from "lucide-react";

export const GuideTab = () => (
  <div className="max-w-6xl mx-auto py-8 space-y-8">
    {/* Page Header */}
    <div className="text-center space-y-4">
      <div className="flex items-center justify-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
          <BookOpen className="w-6 h-6 text-white" />
        </div>
        <div className="text-left">
          <h1 className="text-3xl font-bold text-foreground">QuantifyIQ Guide</h1>
          <p className="text-muted-foreground">Complete guide to portfolio optimization and quantitative analysis</p>
        </div>
      </div>
    </div>

    <Tabs defaultValue="getting-started" className="w-full">
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
        <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
        <TabsTrigger value="tools">Analysis Tools</TabsTrigger>
        <TabsTrigger value="concepts">Key Concepts</TabsTrigger>
        <TabsTrigger value="tips">Tips & Best Practices</TabsTrigger>
      </TabsList>

      <TabsContent value="getting-started" className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground mb-4">Getting Started with QuantifyIQ</h2>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Step 1: Create Your First Portfolio
            </CardTitle>
            <CardDescription>Start by setting up your investment portfolio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">What you need:</h4>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>Stock tickers (e.g., AAPL, MSFT, GOOGL)</li>
                  <li>Current allocation percentages</li>
                  <li>Portfolio value (optional)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">How to do it:</h4>
                <ol className="list-decimal pl-6 space-y-1 text-muted-foreground">
                  <li>Click "Create Portfolio" in the header</li>
                  <li>Enter a descriptive name</li>
                  <li>Add your stocks and weights</li>
                  <li>Click "Analyze Portfolio"</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="w-5 h-5 text-blue-600" />
              Step 2: Explore the Dashboard
            </CardTitle>
            <CardDescription>Get familiar with your portfolio overview</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              The dashboard shows your active portfolio's key metrics, holdings, and recent analysis results. 
              Use this as your home base to monitor performance and access analysis tools.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="font-semibold text-blue-800 dark:text-blue-200">Portfolio Value</div>
                <div className="text-sm text-blue-600 dark:text-blue-400">Your total investment amount</div>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="font-semibold text-green-800 dark:text-green-200">Asset Count</div>
                <div className="text-sm text-green-600 dark:text-green-400">Number of stocks in portfolio</div>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                <div className="font-semibold text-purple-800 dark:text-purple-200">Risk-Free Rate</div>
                <div className="text-sm text-purple-600 dark:text-purple-400">Used in calculations</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Alert>
          <Lightbulb className="h-4 w-4" />
          <AlertDescription>
            <strong>Pro Tip:</strong> Start with a simple 3-4 stock portfolio to get familiar with the tools. 
            You can always create more complex portfolios later!
          </AlertDescription>
        </Alert>
      </TabsContent>

      <TabsContent value="tools" className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground mb-4">Analysis Tools</h2>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Efficient Frontier Analysis
            </CardTitle>
            <CardDescription>Find the optimal risk-return balance for your portfolio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">What it does:</h4>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>Calculates optimal portfolio weights</li>
                  <li>Shows maximum Sharpe ratio portfolio</li>
                  <li>Identifies minimum volatility allocation</li>
                  <li>Visualizes risk-return trade-offs</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">When to use:</h4>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>Optimizing existing portfolios</li>
                  <li>Comparing different allocations</li>
                  <li>Understanding risk-return relationships</li>
                  <li>Academic learning about MPT</li>
                </ul>
              </div>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <div className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Key Metrics Explained:</div>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <Badge variant="outline" className="mb-1">Sharpe Ratio</Badge>
                  <p className="text-muted-foreground">Risk-adjusted return measure</p>
                </div>
                <div>
                  <Badge variant="outline" className="mb-1">Volatility</Badge>
                  <p className="text-muted-foreground">Portfolio risk measure</p>
                </div>
                <div>
                  <Badge variant="outline" className="mb-1">Max Drawdown</Badge>
                  <p className="text-muted-foreground">Worst peak-to-trough loss</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              Black-Litterman Optimization
            </CardTitle>
            <CardDescription>Advanced optimization incorporating your market views</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">How it works:</h4>
                <ol className="list-decimal pl-6 space-y-1 text-muted-foreground">
                  <li>Set expected returns for each stock</li>
                  <li>Assign confidence levels (0.1 to 1.0)</li>
                  <li>Algorithm combines your views with market data</li>
                  <li>Generates optimized portfolio weights</li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Parameters explained:</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <Badge variant="secondary">Expected Return</Badge>
                    <p className="text-muted-foreground">Your forecast for annual returns</p>
                  </div>
                  <div>
                    <Badge variant="secondary">Confidence</Badge>
                    <p className="text-muted-foreground">How sure you are (0.1 = low, 1.0 = high)</p>
                  </div>
                  <div>
                    <Badge variant="secondary">Tau</Badge>
                    <p className="text-muted-foreground">Uncertainty scaling factor</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-red-600" />
              Stress Testing
            </CardTitle>
            <CardDescription>Test your portfolio against historical market crashes</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Stress testing shows how your portfolio would have performed during major market downturns. 
              This helps you understand potential risks and prepare for market volatility.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Historical Events Tested:</h4>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>2000 Dot-Com Crash</li>
                  <li>2008 Financial Crisis</li>
                  <li>2020 COVID-19 Crash</li>
                  <li>2022 Rate Hikes</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">What you'll see:</h4>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>Portfolio vs. benchmark performance</li>
                  <li>Maximum drawdown periods</li>
                  <li>Recovery time analysis</li>
                  <li>Risk distribution charts</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-600" />
              Monte Carlo Simulation
            </CardTitle>
            <CardDescription>Explore thousands of possible future scenarios</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Monte Carlo simulation generates thousands of potential future outcomes for your portfolio 
              based on historical volatility and correlations.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="font-semibold text-green-800 dark:text-green-200">Cone of Possibility</div>
                <div className="text-sm text-green-600 dark:text-green-400">Range of potential outcomes</div>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="font-semibold text-blue-800 dark:text-blue-200">Value at Risk</div>
                <div className="text-sm text-blue-600 dark:text-blue-400">Potential losses at confidence levels</div>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                <div className="font-semibold text-purple-800 dark:text-purple-200">Probability Analysis</div>
                <div className="text-sm text-purple-600 dark:text-purple-400">Likelihood of different outcomes</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="concepts" className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground mb-4">Key Financial Concepts</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Risk vs. Return
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-3">
                The fundamental principle that higher potential returns come with higher risk.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Low Risk:</span>
                  <span className="text-muted-foreground">Bonds, CDs</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Medium Risk:</span>
                  <span className="text-muted-foreground">Diversified stocks</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">High Risk:</span>
                  <span className="text-muted-foreground">Individual stocks, crypto</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Diversification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-3">
                Spreading investments across different assets to reduce risk.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Different sectors</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Various company sizes</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Multiple asset classes</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Sharpe Ratio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-3">
                Measures risk-adjusted return. Higher is better.
              </p>
              <div className="p-3 bg-muted rounded-lg font-mono text-sm">
                Sharpe = (Return - Risk-Free Rate) / Volatility
              </div>
              <div className="mt-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>&gt; 2.0:</span>
                  <Badge variant="default">Excellent</Badge>
                </div>
                <div className="flex justify-between">
                  <span>1.0 - 2.0:</span>
                  <Badge variant="secondary">Good</Badge>
                </div>
                <div className="flex justify-between">
                  <span>&lt; 1.0:</span>
                  <Badge variant="outline">Poor</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Volatility
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-3">
                Measures how much an investment's price fluctuates.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">Low (&lt;10%):</span>
                  <span className="text-muted-foreground">Stable</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Medium (10-20%):</span>
                  <span className="text-muted-foreground">Moderate</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">High (&gt;20%):</span>
                  <span className="text-muted-foreground">Volatile</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="tips" className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground mb-4">Tips & Best Practices</h2>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> QuantifyIQ is an educational tool. Always consult with a financial advisor 
            before making real investment decisions.
          </AlertDescription>
        </Alert>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">Do</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <span className="text-sm">Start with real portfolio data</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <span className="text-sm">Use multiple analysis tools</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <span className="text-sm">Compare against benchmarks</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <span className="text-sm">Understand the math behind results</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <span className="text-sm">Consider transaction costs</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Don't</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                  <span className="text-sm">Don't rely solely on historical data</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                  <span className="text-sm">Don't ignore correlation changes</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                  <span className="text-sm">Don't over-optimize</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                  <span className="text-sm">Don't ignore market conditions</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                  <span className="text-sm">Don't forget about taxes</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-600" />
              Learning Path for Beginners
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">1</span>
                </div>
                <div>
                  <div className="font-semibold">Create a simple portfolio</div>
                  <div className="text-sm text-muted-foreground">Start with 3-4 well-known stocks</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-green-600 dark:text-green-400">2</span>
                </div>
                <div>
                  <div className="font-semibold">Run Efficient Frontier analysis</div>
                  <div className="text-sm text-muted-foreground">Understand risk-return optimization</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-purple-600 dark:text-purple-400">3</span>
                </div>
                <div>
                  <div className="font-semibold">Explore stress testing</div>
                  <div className="text-sm text-muted-foreground">See how your portfolio handles crises</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-orange-600 dark:text-orange-400">4</span>
                </div>
                <div>
                  <div className="font-semibold">Try Black-Litterman optimization</div>
                  <div className="text-sm text-muted-foreground">Incorporate your market views</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-red-600 dark:text-red-400">5</span>
                </div>
                <div>
                  <div className="font-semibold">Run Monte Carlo simulations</div>
                  <div className="text-sm text-muted-foreground">Understand future possibilities</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
); 