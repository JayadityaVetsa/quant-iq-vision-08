import { WelcomeSection } from "../WelcomeSection";
import { FeatureCards } from "../FeatureCards";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { Button } from "../ui/button";
import { PortfolioOverview } from "../PortfolioOverview";

interface DashboardTabProps {
  setActiveTab: (tab: string) => void;
  onCreatePortfolio: () => void;
}

export const DashboardTab = ({ setActiveTab, onCreatePortfolio }: DashboardTabProps) => {
  const { portfolios, activePortfolio } = usePortfolio();

  return (
    <div className="space-y-12">
      <WelcomeSection />

      {portfolios.length > 0 && activePortfolio ? (
        <>
          <PortfolioOverview />
          <FeatureCards setActiveTab={setActiveTab} />
        </>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Get Started by Creating Your First Portfolio
          </h3>
          <p className="text-gray-600 mb-8">
            Once you create a portfolio, you'll see all available analysis tools here.
          </p>
          <Button onClick={onCreatePortfolio} size="lg">
            Create Portfolio
          </Button>
        </div>
      )}
    </div>
  );
};
