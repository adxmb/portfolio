import type { Metadata } from "next";
import { portfolio } from "@/config/portfolioData";
import { ContactSection } from "@/components/sections/ContactSection";

export const metadata: Metadata = {
  title: portfolio.contact.heading,
  description: portfolio.contact.intro,
};

export default function ContactPage() {
  return <ContactSection />;
}
