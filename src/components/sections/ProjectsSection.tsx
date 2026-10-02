import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import { portfolio } from "@/config/portfolioData";
import { ImageParallax } from "@/components/motion/ImageParallax";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { Section } from "./Section";
import { RichText } from "../ui/RichText";

/**
 * The /projects page body. A vertical showcase: each project is a large image
 * that drifts inside its frame as you scroll past, then a two-column write-up
 * (name and links on the left, the story on the right). Vertical scrolling
 * only. Below md the two columns stack.
 */
export function ProjectsSection() {
    const { projects } = portfolio;

    return (
        <Section
            id="projects"
            heading={projects.heading}
            intro={projects.intro}
        >
            <ol className="mt-20 flex flex-col gap-28 md:gap-40">
                {projects.items.map((project) => (
                    <li key={project.id}>
                        <article
                            aria-labelledby={`${project.id}-title`}
                            className="flex flex-col gap-10"
                        >
                            {project.image ? (
                                <ImageParallax
                                    image={project.image}
                                    sizes="(min-width: 1400px) 1336px, 92vw"
                                />
                            ) : null}

                            <RevealGroup className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-12">
                                <div className="flex flex-col gap-4">
                                    <RevealItem
                                        as="p"
                                        className="font-mono text-meta text-muted"
                                    >
                                        {project.year}
                                    </RevealItem>
                                    <h3
                                        id={`${project.id}-title`}
                                        className="text-balance font-display text-h2 font-bold"
                                    >
                                        {project.title}
                                    </h3>
                                    {project.links.length > 0 ? (
                                        <RevealItem as="div">
                                            <ul className="flex flex-wrap gap-x-6 gap-y-2">
                                                {project.links.map((link) => (
                                                    <li key={link.href}>
                                                        <a
                                                            href={link.href}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-flex items-center gap-1.5 text-sm font-medium underline decoration-hairline decoration-2 underline-offset-4 transition-colors duration-300 hover:decoration-accent"
                                                        >
                                                            {link.label}
                                                            <ArrowUpRightIcon
                                                                size={14}
                                                                weight="bold"
                                                                aria-hidden="true"
                                                            />
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </RevealItem>
                                    ) : null}
                                </div>

                                <div className="flex flex-col gap-8">
                                    <RevealItem
                                        as="p"
                                        className="max-w-[52ch] text-lead"
                                    >
                                        {project.summary}
                                    </RevealItem>

                                    <RevealItem as="div">
                                        <dl className="flex max-w-[62ch] flex-col gap-5">
                                            <div>
                                                <dt className="font-mono text-meta text-muted">
                                                    {
                                                        projects.labels
                                                            .description
                                                    }
                                                </dt>
                                                <dd>
                                                    <RichText
                                                        text={
                                                            project.description
                                                        }
                                                    />
                                                </dd>
                                            </div>
                                        </dl>
                                    </RevealItem>

                                    {project.metrics.length > 0 ? (
                                        <RevealItem as="div">
                                            <dl className="flex flex-wrap gap-x-10 gap-y-4">
                                                {project.metrics.map(
                                                    (metric) => (
                                                        <div key={metric.label}>
                                                            <dd className="font-display text-h3 font-bold">
                                                                {metric.value}
                                                            </dd>
                                                            <dt className="text-sm text-muted">
                                                                {metric.label}
                                                            </dt>
                                                        </div>
                                                    ),
                                                )}
                                            </dl>
                                        </RevealItem>
                                    ) : null}

                                    <RevealItem
                                        as="p"
                                        className="text-sm text-muted"
                                    >
                                        {projects.labels.stack}:{" "}
                                        {project.stack.join(", ")}
                                    </RevealItem>
                                </div>
                            </RevealGroup>
                        </article>
                    </li>
                ))}
            </ol>
        </Section>
    );
}
