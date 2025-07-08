import { WelcomeSection } from "@/components/WelcomeSection";
import { QuickStats } from "@/components/QuickStats";
import { FeatureCards } from "@/components/FeatureCards";
import { MetricsCard } from "@/components/MetricsCard";
import { FeatureSquare } from "../ui/feature-square";

interface DashboardTabProps {
  setActiveTab: (tab: string) => void;
}

export const DashboardTab = ({ setActiveTab }: DashboardTabProps) => {
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-16 py-10 md:py-16">
      <FeatureSquare section="welcome">
        <WelcomeSection />
      </FeatureSquare>
      <FeatureSquare section="quickstats">
        <QuickStats />
      </FeatureSquare>
      <FeatureSquare section="features">
        <FeatureCards setActiveTab={setActiveTab} />
      </FeatureSquare>
      <FeatureSquare section="metrics">
        <MetricsCard />
      </FeatureSquare>
    </div>
  );
};
