
import { WelcomeSection } from "@/components/WelcomeSection";
import { QuickStats } from "@/components/QuickStats";
import { FeatureCards } from "@/components/FeatureCards";
import { MetricsCard } from "@/components/MetricsCard";

interface DashboardTabProps {
  setActiveTab: (tab: string) => void;
}

export const DashboardTab = ({ setActiveTab }: DashboardTabProps) => {
  return (
    <div className="space-y-8">
      <WelcomeSection />
      <QuickStats />
      <FeatureCards setActiveTab={setActiveTab} />
      <MetricsCard />
    </div>
  );
};
