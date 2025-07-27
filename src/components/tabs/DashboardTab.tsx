import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { StatsSection } from "@/components/StatsSection";
import { CTASection } from "@/components/CTASection";

interface DashboardTabProps {
  setActiveTab: (tab: string) => void;
  onCreatePortfolio: () => void;
}

export const DashboardTab = ({ setActiveTab, onCreatePortfolio }: DashboardTabProps) => {
  return (
    <div>
      <HeroSection />
      <FeaturesSection />
      <StatsSection />
      <CTASection />
    </div>
  );
};
