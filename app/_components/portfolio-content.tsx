/* eslint-disable @next/next/no-img-element */

import type { Project } from "./portfolio-types";

export function PortfolioContent({
  projects,
  onProjectOpen,
}: {
  projects: readonly Project[];
  onProjectOpen: (project: Project) => void;
}) {
  return (
    <main id="portfolio-content" className="portfolioMain flex flex-row items-start justify-center gap-5 pt-2 max-[900px]:flex-col max-[900px]:items-center">
      <div className="min-w-0 flex-[1_1_0]">
        <section className="portfolioHero mb-2.5 p-[26px] max-[900px]:flex max-[900px]:items-start max-[900px]:justify-between max-[900px]:gap-3.5 max-[900px]:p-[18px]" aria-label="Introduction">
          <div className="min-w-0 flex-[1_1_auto]">
            <h1 className="portfolioHeroTitle m-0 mb-2.5">Designer. Innovator. Facilitator</h1>
            <p className="portfolioHeroIntro m-0 max-w-[56ch]">I design and build modern, accessible web experiences.</p>
          </div>
          <div className="hidden flex-[0_0_116px] max-[900px]:block">
            <img className="portfolioHeroPortrait block h-auto w-full max-w-[116px]" src="/assets/midShot2.jpg" alt="Portrait of Calvin McWilliams" />
          </div>
        </section>

        <section className="portfolioSelectedWork h-auto max-h-[clamp(280px,65vh,477px)] p-[15px] max-[650px]:mb-2.5 max-[650px]:h-[47dvh] max-[650px]:p-2.5" aria-label="Selected work">
          <h2 className="selectedWorkHeading m-0 mb-3.5">Selected Work</h2>
          <div className="portfolioWorkScroll h-[410px] max-h-[clamp(220px,48vh,410px)] overflow-auto">
            <ul className="workList mt-[3px] flex flex-col gap-3.5 p-2.5 max-[650px]:h-[38dvh] max-[650px]:overflow-auto max-[650px]:px-[3%] max-[650px]:pb-[3%] max-[650px]:pt-0" role="list">
              {projects.map((project) => (
                <li key={project.slug}>
                  <button
                    type="button"
                    data-case-study={project.slug}
                    className="caseStudyButton group flex w-full items-center justify-between gap-4 p-[18px] max-[650px]:p-2.5"
                    aria-label={`Open case study: ${project.title}`}
                    onClick={() => onProjectOpen(project)}
                  >
                    <span className="flex min-w-0 flex-col gap-1.5">
                      <span className="caseStudyTitle overflow-hidden text-ellipsis whitespace-nowrap">{project.title}</span>
                      <span className="caseStudySubtitle">{project.subtitle}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <section className="portfolioProfile w-full max-w-[clamp(280px,34vw,420px)] overflow-hidden max-[900px]:hidden" aria-label="Profile">
        <div className="portfolioProfileInner">
          <div className="portfolioProfileImage">
            <img className="profilePortrait block h-auto w-full object-cover aspect-[4/5]" src="/assets/midShot2.jpg" alt="Portrait of Calvin McWilliams" />
          </div>
          <div className="portfolioProfileCopy px-[18px] pb-5 pt-[18px]">
            <div className="profileName mb-1.5">Calvin McWilliams</div>
            <div className="profileRole">UX Engineer / Frontend Design Systems</div>
          </div>
        </div>
      </section>
    </main>
  );
}
