import Link from "next/link";
import { portfolio } from "@/config/portfolioData";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { Section } from "@/components/sections/Section";
import { ViewAllLink } from "./ViewAllLink";

/**
 * Landing preview of /projects: a typographic index. Each project is one
 * large title with its year, and the whole row opens the projects page.
 * Layout family: type-led index.
 */
export function ProjectsPreview() {
    const { projects, home } = portfolio;
    const items = projects.items.slice(0, home.projectsPreviewCount);

    return (
        <Section
            id="projects-preview"
            heading={projects.heading}
            intro={projects.intro}
            bgSection
        >
            <RevealGroup className="mt-16">
                <ul className="flex flex-col gap-4">
                    {items.map((project) => (
                        <RevealItem as="li" key={project.id}>
                            <Link
                                href="/projects"
                                className="group flex flex-col gap-2 py-3 md:flex-row md:items-baseline md:justify-between md:gap-10"
                            >
                                <span className="block font-display text-h2 font-bold transition-transform duration-500 ease-spring-out group-hover:translate-x-3 group-focus-visible:translate-x-3">
                                    {project.title}
                                </span>
                                <span className="shrink-0 font-mono text-meta text-muted">
                                    {project.year}
                                </span>
                            </Link>
                        </RevealItem>
                    ))}
                </ul>
                <div className="mt-12">
                    <ViewAllLink
                        href="/projects"
                        label={projects.viewAllLabel}
                    />
                </div>
            </RevealGroup>
        </Section>
    );
}
