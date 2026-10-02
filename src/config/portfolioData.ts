/**
 * PORTFOLIO CONTENT CONFIGURATION
 *
 * This file is the single source of truth for every piece of copy, every link
 * and every image path on the site. Components never contain hardcoded content.
 *
 * SITE MAP
 *   /              landing: the name alone (interactive), then a static headline
 *                  and a preview of each subpage (each with its own background
 *                  image), and a closing contact block
 *   /professional  education, internships and work experience (career facts)
 *   /projects      independent technical projects built in your own time
 *   /sidequests    personal updates, hobbies, logs and creative explorations
 *   /contact       how to reach you
 *
 * HOW TO EDIT
 * 1. Every placeholder is wrapped in double square brackets, like [[this]].
 *    Run `npm run placeholders` for a list of everything left to replace, with
 *    line numbers.
 * 2. Images: put the file in /public/images and set src to "/images/name.jpg".
 *    While src is "" the site renders a labelled placeholder frame that says
 *    what belongs there. width and height set the frame's aspect ratio, so use
 *    the real pixel size of your file.
 * 3. Lines tagged "@placeholder" hold sample values that look real (dates,
 *    the local site URL). They are not wrapped in [[ ]] because they must stay
 *    valid, so replace them too.
 * 4. To add a job, a project or a sidequest, copy an existing object in its
 *    array and edit it. Nothing else in the codebase needs to change.
 * 5. To reorder the career sections (for example to put education first),
 *    reorder the objects inside professional.groups.
 *
 * CONTENT RULES THE DESIGN RELIES ON
 * - Hero headline: 2 lines at most on desktop. Hero subtext: 20 words at most.
 * - Only publish numbers you can defend. Leave a metrics array empty rather
 *   than guess.
 * - Use a plain hyphen (-) for ranges and pauses. Do not use em or en dashes.
 * - One label per intent. CONTACT_LABEL below is reused by the nav, the hero
 *   and the contact page so the action reads the same everywhere.
 */

import { NAME_VARIANTS } from "@/components/home/name/registry";

/* ------------------------------------------------------------------------ */
/* Types                                                                    */
/* ------------------------------------------------------------------------ */

export interface ImageAsset {
    /** "/images/file.jpg" (from /public) or an https URL. Empty string shows a placeholder frame. */
    src: string;
    /** Describes the image for screen readers. Write what it shows, not "image of". */
    alt: string;
    /** Real pixel width of the file. Sets the frame aspect ratio together with height. */
    width: number;
    /** Real pixel height of the file. */
    height: number;
    /** Shown inside the placeholder frame while src is empty: what belongs here. */
    slotLabel: string;
}

export interface Link {
    label: string;
    href: string;
}

export type SocialIcon =
    | "github"
    | "linkedin"
    | "x"
    | "mastodon"
    | "rss"
    | "letterboxd"
    | "email";

export interface SocialLink extends Link {
    icon: SocialIcon;
}

export interface Metric {
    label: string;
    value: string;
}

/** One education, internship or job entry on the /professional page. */
export interface CareerEntry {
    id: string;
    /** Job title, internship title or degree, e.g. "BSc Computer Science". */
    title: string;
    /** Employer or institution. */
    organisation: string;
    /** Optional city or "Remote". Shown next to the organisation. */
    location?: string;
    /** Start date as "YYYY-MM". Entries are sorted newest first by this value. */
    startDate: string;
    /** "YYYY-MM", or "present" for something ongoing. Omit for a single moment. */
    endDate?: string;
    /** One or two sentences. */
    summary: string;
    /** Concrete achievements or responsibilities. Real numbers only. Empty array hides the list. */
    highlights: string[];
    /** Technologies used. Empty array hides the line. */
    technologies: string[];
    link?: Link;
}

/** A titled block on the /professional page, such as "Work experience". */
export interface CareerGroup {
    id: string;
    heading: string;
    entries: CareerEntry[];
}

/** One independent project on the /projects page. */
export interface Project {
    id: string;
    title: string;
    /** Four-digit year, e.g. "2025". */
    year: string;
    /** One sentence, 25 words at most. */
    summary: string;
    description: string;
    /** Real, defensible numbers only. An empty array hides the metrics row. */
    metrics: Metric[];
    /** Technology names, shown as plain text. */
    stack: string[];
    image?: ImageAsset;
    links: Link[];
}

export type AccentPreset = "signal" | "coral" | "sage" | "violet";

/** Which effect the name in the first screen uses. */
export type NameVariant =
    | "kinetic"
    | "magnetic"
    | "liquid"
    | "elastic"
    | "horizon"
    | "depth"
    | "glitch";

/** Which transition plays between the two background images as you scroll the landing page. */
export type BackgroundTransitionType = "mask" | "blur";

export type SidequestCategory =
    | "hobby"
    | "learning"
    | "log"
    | "milestone"
    | "exploration";

/**
 * One personal update on the /sidequests page. The image is used at thumbnail
 * size in the orbiting carousel and at full size in its central frame, so
 * supply a photo that survives both crops.
 */
export interface Sidequest {
    id: string;
    title: string;
    category: SidequestCategory;
    /** "YYYY-MM". Entries are sorted newest first by this value. */
    date: string;
    /** One or two sentences, 25 words at most. */
    summary: string;
    image: ImageAsset;
    link?: Link;
}

export interface PortfolioData {
    meta: {
        /** Full URL of the deployed site. Used for metadata and social previews. */
        siteUrl: string;
        /** BCP 47 language tag for the html lang attribute. */
        locale: string;
        title: string;
        /** "%s" is replaced by the page title on inner pages. */
        titleTemplate: string;
        description: string;
    };
    person: {
        name: string;
        role: string;
        email: string;
    };
    ui: {
        skipToContent: string;
        navLabel: string;
        themeToggleLabel: string;
        /** Small label inside every empty image frame. */
        placeholderLabel: string;
    };
    nav: {
        links: Link[];
        cta: Link;
    };

    backdrop: {
        type: "bento" | "grain" | "off";
        grainImage: ImageAsset;
    };
    home: {
        /** How many items each preview section on the landing page shows. */
        professionalPreviewCount: number;
        projectsPreviewCount: number;
        sidequestsPreviewCount: number;
        /** Which effect the name uses first. "magnetic" splits it into 3D letters that lean toward the cursor, "liquid" warps it with mouse speed. */
        nameVariant: NameVariant;
        /** Which background transition is shown first: "mask", "blur", "slit" (slit-scan) or "tunnel" (depth zoom). */
        backgroundTransition: BackgroundTransitionType;
        /**
         * The small switch panel at the bottom right of the landing page, used to
         * compare the variants. Set enabled to false once you have chosen, and set
         * nameVariant and backgroundTransition above to your choices.
         */
        accentPreset: AccentPreset;
        nameVariantHints: Partial<Record<NameVariant, string>>;
        preview: {
            enabled: boolean;
            /** Accessible label of the cog button that opens the drawer */
            toggleLabel: string;
            groupLabel: string;
            nameLabel: string;
            nameOptions: Record<NameVariant, string>;
            backgroundLabel: string;
            backgroundOptions: Record<BackgroundTransitionType, string>;
            accentLabel: string;
            accentOptions: Record<AccentPreset, string>;
        };
        /**
         * One background image per landing-page section that sits over the fixed
         * background layer, in the same order the sections render:
         * 0 headline, 1 professional preview, 2 projects preview, 3 sidequests preview.
         * As you scroll from one section to the next, the background transitions
         * from that section's image to the next one's.
         */
        background: {
            /** 0 to 1. How strongly the page colour covers the images so text stays readable. */
            scrimOpacity: number;
            images: [ImageAsset, ImageAsset, ImageAsset, ImageAsset];
        };
    };
    hero: {
        /** The static headline under the name. Keep it to two short lines. */
        headline: string;
        /** 20 words at most. */
        subtext: string;
        primaryCta: Link;
        secondaryCta: Link;
    };
    professional: {
        heading: string;
        intro: string;
        /** Label of the landing page link that opens the full professional page. */
        viewAllLabel: string;
        /** Displayed as the end date when endDate is "present". */
        presentLabel: string;
        technologiesLabel: string;
        groups: CareerGroup[];
    };
    projects: {
        heading: string;
        intro: string;
        /** Label of the landing page link that opens the full projects page. */
        viewAllLabel: string;
        labels: {
            description: string;
            stack: string;
        };
        items: Project[];
    };
    sidequests: {
        heading: string;
        intro: string;
        /** Label of the landing page link that opens the full sidequests page. */
        viewAllLabel: string;
        emptyState: string;
        /** Accessible name of the orbiting carousel. */
        rotatorLabel: string;
        /** Short instruction shown under the carousel. */
        rotatorHint: string;
        /** Display name for each category. Edit the words freely, keep the keys. */
        categories: Record<SidequestCategory, string>;
        items: Sidequest[];
    };
    contact: {
        heading: string;
        intro: string;
        /** Large headline of the closing call to action on the landing page. */
        ctaHeadline: string;
        /** Accessible name for the list of profile links. */
        linksLabel: string;
        links: SocialLink[];
    };
}

/* ------------------------------------------------------------------------ */
/* Shared labels                                                            */
/* ------------------------------------------------------------------------ */

/** The one label for the contact action, reused everywhere it appears. */
const CONTACT_LABEL = "Contact";

/* ------------------------------------------------------------------------ */
/* Content                                                                  */
/* ------------------------------------------------------------------------ */

export const portfolio: PortfolioData = {
    meta: {
        siteUrl: "http://localhost:3000", // @placeholder replace with your deployed URL
        locale: "en",
        title: "Adam Bodicoat | Software Designer",
        titleTemplate: "%s | Adam Bodicoat",
        description:
            "Creating and using software to improve efficiency, performance, and everyday life.",
    },

    person: {
        name: "Adam Bodicoat",
        role: "Software Designer",
        email: "adam.r.bodicoat@gmail.com",
    },

    ui: {
        skipToContent: "Skip to content",
        navLabel: "Primary",
        themeToggleLabel: "Toggle light and dark theme",
        placeholderLabel: "Placeholder image",
    },

    nav: {
        links: [
            { label: "Professional", href: "/professional" },
            { label: "Projects", href: "/projects" },
            { label: "Sidequests", href: "/sidequests" },
        ],
        cta: { label: CONTACT_LABEL, href: "/contact" },
    },

    backdrop: {
        type: "bento",
        grainImage: {
            src: "/images/bg-grain.jpg",
            alt: "",
            width: 1920,
            height: 1080,
            slotLabel:
                "Still photo for the grain backdrop, landscape 16:9. Save as /public/images/bg-grain.jpg",
        },
    },

    home: {
        professionalPreviewCount: 3,
        projectsPreviewCount: 3,
        sidequestsPreviewCount: 2,
        nameVariant: "kinetic",
        backgroundTransition: "blur",
        accentPreset: "signal" as AccentPreset,
        nameVariantHints: {
            kinetic: "Kinetic Effect: try interact with text",
            magnetic: "Magnetic Effect: try interact with text",
            liquid: "Liquid Effect: try move cursor at different speeds",
            elastic: "Elastic Effect: try dragging some of the letters",
            glitch: "Glitch Effect: try interact with text",
            depth: "Depth Effect: try interact with text",
            horizon: "Horizon Effect",
        } satisfies Partial<Record<NameVariant, string>>,
        preview: {
            enabled: true,
            toggleLabel: "Design Settings",
            groupLabel: "Preview variants",
            nameLabel: "Name Effects",
            nameOptions: {
                kinetic: "Kinetic",
                magnetic: "Magnetic",
                liquid: "Liquid",
                elastic: "Elastic",
                glitch: "Glitch",
                depth: "Depth",
                horizon: "Horizon",
            },
            backgroundLabel: "Background Effects",
            backgroundOptions: {
                blur: "Blur",
                mask: "Mask",
            },
            accentLabel: "Accent Colour",
            accentOptions: {
                signal: "Signal",
                coral: "Coral",
                sage: "Sage",
                violet: "Violet",
            } satisfies Record<AccentPreset, string>,
        },
        // ASSET REPLACEMENT: each entry below is one section's background image.
        // Save your own 1920x1080-or-larger landscape photo to /public/images using
        // the filename already given (or change src to point at a file of your own
        // choosing), then set alt to a real description. Leaving src empty shows a
        // labelled placeholder frame instead of a broken image, so nothing here can
        // ever point at a missing file by accident.
        background: {
            scrimOpacity: 0.62,
            images: [
                {
                    src: "/images/bg-headline.jpg", // shown behind the static headline
                    alt: "",
                    width: 1920,
                    height: 1080,
                    slotLabel:
                        "Headline background, landscape 16:9, at least 1920 px wide. Save as /public/images/bg-headline.jpg",
                },
                {
                    src: "/images/bg-professional.jpg", // shown behind the professional preview
                    alt: "",
                    width: 1920,
                    height: 1080,
                    slotLabel:
                        "Professional background, landscape 16:9, at least 1920 px wide. Save as /public/images/bg-professional.jpg",
                },
                {
                    src: "/images/bg-projects.jpg", // shown behind the projects preview
                    alt: "",
                    width: 1920,
                    height: 1080,
                    slotLabel:
                        "Projects background, landscape 16:9, at least 1920 px wide. Save as /public/images/bg-projects.jpg",
                },
                {
                    src: "/images/bg-sidequests.jpg", // shown behind the sidequests preview
                    alt: "",
                    width: 1920,
                    height: 1080,
                    slotLabel:
                        "Sidequests background, landscape 16:9, at least 1920 px wide. Save as /public/images/bg-sidequests.jpg",
                },
            ],
        },
    },

    hero: {
        headline: "Designing, Creating, Developing",
        subtext:
            "Creating and using software to improve efficiency, performance, and everyday life." +
            "Keep up with what I'm doing professionally, what I've been working on in my own time, and other ongoing sidequests.",
        primaryCta: { label: CONTACT_LABEL, href: "/contact" },
        secondaryCta: { label: "See projects", href: "/projects" },
    },

    professional: {
        heading: "Professional",
        intro: "Graduate software engineer with global professional experience",
        viewAllLabel: "Full CV",
        presentLabel: "Present",
        technologiesLabel: "Skills",
        groups: [
            {
                id: "experience",
                heading: "Work experience",
                entries: [
                    {
                        id: "jane-street",
                        title: "TDOE Intern",
                        organisation: "Jane Street",
                        location: "Hong Kong",
                        startDate: "2025-12", // @placeholder
                        endDate: "2026-02",
                        summary:
                            "Trading desk operations engineer, worked across both development and trading in a fast-paced environment, building tools to improve the efficiency of trading desks. Learnt functional programming, market-making skills, and trading workflows.",
                        highlights: [
                            "Working on three separate projects across different trading desks developing tools to improve efficieny, workflows, and insights.",
                            "Performing day-to-day tasks to assist traders with daily activities.",
                            "Participating in workshops and classes teaching the fundamentals of trading and market making.",
                        ],
                        technologies: [
                            "Quantative Trading",
                            "Market Making",
                            "OCaml",
                            "Python",
                        ],
                        link: {
                            label: "Company site",
                            href: "https://www.janestreet.com",
                        },
                    },
                    {
                        id: "summer-research",
                        title: "Summer Research Scholar",
                        organisation:
                            "The University of Auckland, Engineering Department",
                        location: "Auckland",
                        startDate: "2024-11", // @placeholder
                        endDate: "2025-02", // @placeholder
                        summary:
                            "Researching Large Language Models' (LLMs) capabilities for test oracle generation with real-world bugs and various prompting strategies at the University of Auckland.",
                        highlights: [
                            "Developed a Python tool to automatically evaluate the quality of test assertions generated by OpenAI and StarCoder LLMs against 36 bugs and 4 strategies over more than 2,000 tests.",
                            "Published in AIware Conference, November 2025.",
                        ],
                        technologies: ["Academic Research", "Java", "LLMs"],
                        link: {
                            label: "Publication",
                            href: "https://ieeexplore.ieee.org/document/11334275",
                        },
                    },
                ],
            },
            {
                id: "education",
                heading: "Education",
                entries: [
                    {
                        id: "undergraduate",
                        title: "Bachelor of Software Engineering (Honours)",
                        organisation: "The University of Auckland",
                        location: "Auckland",
                        startDate: "2022-02", // @placeholder
                        endDate: "2025-12", // @placeholder
                        summary:
                            "Graduated with First Class Honours in a Bachelor of Software Engineering (Honours) from the University of Auckland in 2026, with a cumulative GPA of 8.5/9.0 (A+).",
                        highlights: [
                            "Received the First in Course award for SOFTENG 281 and a Summer Research Scholarship.",
                        ],
                        technologies: [],
                    },
                ],
            },
        ],
    },

    projects: {
        heading: "Projects",
        intro: "What I build in my spare time",
        viewAllLabel: "All projects",
        labels: {
            description: "Description",
            stack: "Skills",
        },
        items: [
            {
                id: "neural-network",
                title: "Neural Network",
                year: "2025",
                summary:
                    "Custom neural network implementation for English accent detection",
                description:
                    "Built a lightweight neural network trained to detect different English accents from audio recordings." +
                    " Trained using a custom dataset of five predominant English-speaking accents.\n" +
                    "Explored different training strategies and hyperparameters to evaluate the model's performance" +
                    " and understand the impact of dataset composition on classification accuracy.\n",
                metrics: [],
                stack: ["Python", "NumPy", "Flask"],
                links: [
                    {
                        label: "Repo",
                        href: "https://github.com/adxmb/neural-network",
                    },
                ],
            },
            {
                id: "plantr",
                title: "AI Plant Matcher",
                year: "2024",
                summary:
                    "Webapplication powered by AI to match users to suitable plants",
                description:
                    "A proof-of-concept web application created for the DEVs Hackathon with the theme Hack for Humanity." +
                    " *Plantr* uses AI to make plant discovery engaging, allowing users to match with recommended plants based on their" +
                    " profile via Tinder-esque swiping. 1st Place in UoA DEVS Hackathon 2024.",
                metrics: [],
                stack: ["React", "Node.js", "OpenAI"],
                links: [
                    {
                        label: "Repo",
                        href: "https://github.com/LocalhostLtd/DEV-Hackathon-2024",
                    },
                ],
            },
            {
                id: "llm-test-oracles",
                title: "LLM Research",
                year: "2024-2025",
                summary: "Understanding LLM-Driven Test Oracle Generation",
                description:
                    "Researching Large Language Models' (LLMs) capabilities for test oracle generation with real-world bugs" +
                    " and various prompting strategies at the University of Auckland.\nDeveloped a Python tool to automatically" +
                    " evaluate the quality of test assertions generated by OpenAI and StarCoder LLMs against 36 bugs and 4" +
                    " strategies over more than 2,000 tests. Published in AIware Conference, November 2025.",
                metrics: [],
                stack: ["Academic Research", "Java", "LLMs"],
                links: [
                    {
                        label: "Publication",
                        href: "https://ieeexplore.ieee.org/document/11334275",
                    },
                ],
            },
        ],
    },

    sidequests: {
        heading: "Sidequests",
        intro: "Some hobbies, activities, and updates.",
        viewAllLabel: "All sidequests",
        emptyState: "Nothing here yet.",
        rotatorLabel: "Sidequests carousel",
        rotatorHint: "Drag, swipe sideways or click a thumbnail",
        categories: {
            hobby: "Hobby",
            learning: "Learning",
            log: "Log",
            milestone: "Milestone",
            exploration: "Exploration",
        },
        items: [
            {
                id: "sidequest-1",
                title: "Baking",
                category: "hobby",
                date: "",
                summary:
                    "Baking helps satisfy my sweettooth while improving my cooking skills." +
                    " Typically I bake different types of cakes and pastries, most recently I've been perfecting my choux recipe." +
                    " I've also been working on creating full dishes with various elements and improving my plating.\n\n" +
                    "Some of my favourite bakes include: cinnamon and vanilla eclairs with a cinnamon and vanilla mascarpone cream and cinnamon crumble, " +
                    "chantily cake with blueberry and strawberry garnish, and baked lemon cheesecake.",
                image: {
                    src: "/images/sidequests/baking.jpg",
                    alt: "",
                    width: 1000,
                    height: 1000,
                    slotLabel: "",
                },
            },
            {
                id: "sidequest-2",
                title: "Piano",
                category: "hobby",
                date: "",
                summary:
                    "Playing piano is something that both helps me relax and gives me something meaningful to improve and work towards in my own time.\n\n" +
                    "Working towards a music diploma in piano where I will be performing the following repertoire: *Liszt Liebesträume no.3*, *Debussy La plus que lente*," +
                    " *Wilkinson Oiseaux d'eau*, *Chopin Ballade no.1*, and *Rachmaninov/Kreisler Liebesleid*.\n\n" +
                    "Some other pieces I've been working on on the side: *Ravel Jeux d'eau*, *Liszt Transcendental Étude No. 4*, " +
                    " *Chopin Waltz in A-flat major, Op.42*, and some of *Scriabin's Preludes from Op.11*.",
                image: {
                    src: "/images/sidequests/piano.jpg",
                    alt: "",
                    width: 1000,
                    height: 1000,
                    slotLabel: "",
                },
            },
            {
                id: "sidequest-3",
                title: "Movie Recs",
                category: "log",
                date: "",
                summary:
                    "Here are some of the movies I would recommend everyone watch:\n" +
                    "• **12 Angry Men** (1957), the biggest comeback in cinema history, just a compelling watch.\n" +
                    "• **Castle in the Sky** (1986), a whimsical adventure exploring secrets hidden amongst the clouds.\n" +
                    "• **Do the Right Thing** (1989), it's the hottest day of the year and racial tensions are rising in Brooklyn.\n" +
                    "• **Sound of Metal** (2019), heavy metal drummer grapples with hearing loss.\n" +
                    "• **Moonrise Kingdom** (2012), two kids run away in the wilderness as various authorities try to hunt them down.\n" +
                    "• **The Princess Bride** (1987), a classic, easy watch for a more chill movie night.",
                image: {
                    src: "/images/sidequests/movie.jpg",
                    alt: "",
                    width: 1000,
                    height: 1000,
                    slotLabel: "",
                },
            },
            {
                id: "sidequest-4",
                title: "TV Recs",
                category: "log",
                date: "",
                summary:
                    "I don't watch as much TV but here are a couple shows I think are worth a share:\n" +
                    "• **Avatar: The Last Air Bender** (2005-2008), such good character work and world building, fully emersive on every rewatch.\n" +
                    "• **Succession** (2018-2023), great show, love the drama, what more can I say that hasn't already been said.\n" +
                    "• **Task Master** (2015-), you can watch any episode of any season and it will be an absolute banger (UK version only).\n" +
                    "• **Extracurricular** (2020), really good at hooking you in, feels uniquely real.\n" +
                    "• **Mastchef Australia** (2009-), I really appreciate, more than any other cooking show, the passion put into teaching and developing everyone's skills rather than simply berating a chef who doesn't cook well one time.",
                image: {
                    src: "/images/sidequests/tv.jpg",
                    alt: "",
                    width: 1000,
                    height: 1000,
                    slotLabel: "",
                },
            },
            {
                id: "sidequest-5",
                title: "Anime Recs",
                category: "log",
                date: "",
                summary:
                    "Even if you're not really into anime, these are some just flatout good shows regardless:\n" +
                    "• **Frieren: Beyond Journey's End** (2023-), a nostalgic elf recreates her jourey and starts to discover more about herself along the way.\n" +
                    "• **Haikyuu!!** (2014-2020), the characters and characterisations make the world feel so real, I haven't met anyone who's watch this and didn't enjoy it.\n" +
                    "• **Cowboy Bebop** (1998-1999) might feel like a space cowboy western at first, but it's ultimately a great study of how holding onto the past can keep you from truly living in the present.",
                image: {
                    src: "/images/sidequests/anime.jpg",
                    alt: "",
                    width: 1000,
                    height: 1000,
                    slotLabel: "",
                },
            },
            {
                id: "sidequest-6",
                title: "My Letterboxd",
                category: "log",
                date: "",
                summary:
                    "Wanna keep up with what I'm watching? Checkout my letterboxd to keep up to date with what I've been watching recently!",
                image: {
                    src: "/images/sidequests/letterboxd.jpg",
                    alt: "",
                    width: 1000,
                    height: 1000,
                    slotLabel: "",
                },
                link: {
                    label: "Letterboxd",
                    href: "https://letterboxd.com/adxmb/",
                },
            },
            {
                id: "sidequest-7",
                title: "What I've Been Reading",
                category: "log",
                date: "",
                summary:
                    "Some of the books I've enjoyed recently:\n" +
                    "• **The Psychology Of Money**, Morgan Housel (2020)\n" +
                    "• **Do Androids Dream Of Electric Sheep**, Phillip K. Dick (1968)\n" +
                    "• **Feel The Fear And Do It Anyway**, Susan Jeffers (1987)\n" +
                    "• **Made In China**, Anna Qu (2022)",
                image: {
                    src: "/images/sidequests/books.jpg",
                    alt: "",
                    width: 1000,
                    height: 1000,
                    slotLabel: "",
                },
            },
            {
                id: "sidequest-8",
                title: "Sports",
                category: "hobby",
                date: "",
                summary:
                    "Currently, I do a mix of gym training, volleyball, and basketball. In school, I played water polo and swam competitively, but stopped when I was 16." +
                    " After a couple of relatively inactive years at university, I decided to get back into exercise by casually picking up volleyball and basketball and starting to go to the gym.\n\n" +
                    "Since starting regular exercise I've noticed very positive changes in my mental." +
                    " I think people tend to neglect sports and exercise during adulthood, however, I would encourage everyone to pick them up, doesn't have to be competitive, but just enough to get the body consistently moving.",
                image: {
                    src: "/images/sidequests/sport.jpg",
                    alt: "",
                    width: 1000,
                    height: 1000,
                    slotLabel: "",
                },
            },
            // {
            //     id: "sidequest-9",
            //     title: "",
            //     category: "hobby",
            //     date: "",
            //     summary: "",
            //     image: {
            //         src: "",
            //         alt: "",
            //         width: 1000,
            //         height: 1000,
            //         slotLabel: "",
            //     },
            // },
            // {
            //     id: "sidequest-10",
            //     title: "",
            //     category: "hobby",
            //     date: "",
            //     summary: "",
            //     image: {
            //         src: "",
            //         alt: "",
            //         width: 1000,
            //         height: 1000,
            //         slotLabel: "",
            //     },
            // },
            // {
            //     id: "sidequest-11",
            //     title: "",
            //     category: "hobby",
            //     date: "",
            //     summary: "",
            //     image: {
            //         src: "",
            //         alt: "",
            //         width: 1000,
            //         height: 1000,
            //         slotLabel: "",
            //     },
            // },
            // {
            //     id: "sidequest-12",
            //     title: "",
            //     category: "hobby",
            //     date: "",
            //     summary: "",
            //     image: {
            //         src: "",
            //         alt: "",
            //         width: 1000,
            //         height: 1000,
            //         slotLabel: "",
            //     },
            // },
        ],
    },

    contact: {
        heading: CONTACT_LABEL,
        intro: "Want to get in contact? Feel free to reach out on my email of any of my socials!",
        ctaHeadline: "Want to get in touch?",
        linksLabel: "Profiles",
        links: [
            {
                label: "GitHub",
                href: "https://github.com/adxmb",
                icon: "github",
            },
            {
                label: "LinkedIn",
                href: "https://linkedin.com/in/adam-bodicoat",
                icon: "linkedin",
            },
            {
                label: "LetterBoxd",
                href: "https://letterboxd.com/adxmb",
                icon: "letterboxd",
            },
            {
                label: "Email",
                href: "mailto:adam.r.bodicoat@gmail.com",
                icon: "email",
            },
        ],
    },
};

export const accentPresetColours: Record<AccentPreset, string> = {
    signal: "#7d9ae9",
    coral: "#e98d7d",
    sage: "#8fae8b",
    violet: "#a487d1",
};

const accentPresetKeys = Object.keys(accentPresetColours) as AccentPreset[];

export function isAccentPreset(value: string): value is AccentPreset {
    return (accentPresetKeys as string[]).includes(value);
}
