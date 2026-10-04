import { portfolio } from "@/config/portfolioData";
import { HomePreviewProvider } from "@/components/home/HomePreviewContext";
import { NameHero } from "@/components/home/NameHero";
import { SectionBackgroundManager } from "@/components/background/SectionBackgroundManager";
import { HeadlineSection } from "@/components/home/HeadlineSection";
import { ProfessionalPreview } from "@/components/home/ProfessionalPreview";
import { ProjectsPreview } from "@/components/home/ProjectsPreview";
import { SidequestsPreview } from "@/components/home/SidequestsPreview";
import { ContactCta } from "@/components/home/ContactCta";
import { SettingsDrawer } from "@/components/home/SettingsDrawer";
import { NameHintToast } from "@/components/home/NameHintToast";

/**
 * Landing page, in three movements.
 *
 * 1. The name, alone and centred, as the one interactive element.
 * 2. The story: a static headline as an anchor, then a preview of each
 *    subpage. Each of these four sections carries its own background image
 *    (portfolio.home.background.images, in this order) and SectionBackgroundManager
 *    plays a transition between them as you scroll from one into the next.
 * 3. The closing contact block, on the plain page colour.
 *
 * Which name effect and which background transition show first is set in
 * portfolio.home. The switch panel lets you compare them live.
 */
export default function HomePage() {
    const { home } = portfolio;

    return (
        <HomePreviewProvider
            defaults={{
                nameVariant: home.nameVariant,
                backgroundTransition: home.backgroundTransition,
                accentPreset: home.accentPreset,
            }}
            nameVariantHints={home.nameVariantHints}
        >
            <NameHero />
            <NameHintToast />

            <SectionBackgroundManager>
                <HeadlineSection />
                <ProfessionalPreview />
                <ProjectsPreview />
                <SidequestsPreview />
            </SectionBackgroundManager>

            <ContactCta />

            <SettingsDrawer
                toggleLabel={home.preview.toggleLabel}
                groupLabel={home.preview.groupLabel}
                nameLabel={home.preview.nameLabel}
                nameOptions={home.preview.nameOptions}
                backgroundLabel={home.preview.backgroundLabel}
                backgroundOptions={home.preview.backgroundOptions}
                accentLabel={home.preview.accentLabel}
                accentOptions={home.preview.accentOptions}
            />
        </HomePreviewProvider>
    );
}
