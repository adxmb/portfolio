import type { Metadata } from "next";
import { portfolio } from "@/config/portfolioData";
import { ProfessionalSection } from "@/components/sections/ProfessionalSection";

export const metadata: Metadata = {
  title: portfolio.professional.heading,
  description: portfolio.professional.intro,
};

export default function ProfessionalPage() {
  return <ProfessionalSection />;
}
