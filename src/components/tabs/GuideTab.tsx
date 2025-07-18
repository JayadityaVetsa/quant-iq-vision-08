import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const GuideTab = () => (
  <div className="max-w-3xl mx-auto py-10 space-y-8">
    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6 text-center">User Guide</h1>
    <Card>
      <CardHeader>
        <CardTitle>Dashboard</CardTitle>
        <CardDescription>Quick overview of your portfolio and app features</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="list-disc pl-6 space-y-2 text-slate-700">
          <li>See a summary of your portfolio and key statistics at a glance.</li>
          <li>Access all main features from one place.</li>
          <li>Click on any feature card to jump to that tool.</li>
        </ul>
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Optimizer</CardTitle>
        <CardDescription>Find the best mix of stocks for your goals</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="list-disc pl-6 space-y-2 text-slate-700">
          <li>Enter your current stock tickers and weights.</li>
                      <li>Click "Optimize Portfolio" to see suggested improvements using Efficient Frontier (EF).</li>
          <li>Compare your portfolio to optimized and benchmark portfolios.</li>
          <li>Review risk, return, and allocation charts to understand your options.</li>
        </ul>
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle>Stock Analyzer</CardTitle>
        <CardDescription>Deep dive into individual stocks</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="list-disc pl-6 space-y-2 text-slate-700">
          <li>Type in a stock ticker to analyze its performance and risk.</li>
          <li>View technical indicators, return distributions, and educational explanations.</li>
          <li>Use this tool to learn more about any stock before investing.</li>
        </ul>
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle>Monte Carlo Simulator</CardTitle>
        <CardDescription>See possible future outcomes for your portfolio</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="list-disc pl-6 space-y-2 text-slate-700">
          <li>Enter your portfolio details and simulation settings.</li>
          <li>Click "Run Simulation" to generate thousands of possible future scenarios.</li>
          <li>Explore the cone of possibility, value distributions, and risk metrics.</li>
          <li>Drag and reorder the charts to customize your view.</li>
        </ul>
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle>Tips for Beginners</CardTitle>
        <CardDescription>How to get the most out of QuantifyIQ</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="list-disc pl-6 space-y-2 text-slate-700">
          <li>Start with the Dashboard to get a feel for the app.</li>
          <li>Use the Portfolio Optimizer to improve your investment mix.</li>
          <li>Analyze individual stocks to learn more about them.</li>
          <li>Use the Monte Carlo Simulator to understand risk and possible outcomes.</li>
          <li>Don't be afraid to experiment—no real money is at risk in the app!</li>
        </ul>
      </CardContent>
    </Card>
  </div>
); 