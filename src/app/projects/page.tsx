import type { Metadata } from "next";
import { portfolio } from "@/config/portfolioData";
import { ProjectsSection } from "@/components/sections/ProjectsSection";

export const metadata: Metadata = {
  title: portfolio.projects.heading,
  description: portfolio.projects.intro,
};

export default function ProjectsPage() {
  return <ProjectsSection />;
}
