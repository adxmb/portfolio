import type { Metadata } from "next";
import { portfolio } from "@/config/portfolioData";
import { SidequestsSection } from "@/components/sections/SidequestsSection";

export const metadata: Metadata = {
  title: portfolio.sidequests.heading,
  description: portfolio.sidequests.intro,
};

export default function SidequestsPage() {
  return <SidequestsSection />;
}
