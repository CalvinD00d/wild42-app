"use client";

/* eslint-disable @next/next/no-img-element -- Native images preserve the Vite layout geometry during regression migration. */

import {
  type KeyboardEvent,
  useEffect,
  useState,
} from "react";
import { InfoContent } from "./info-content";
import { ModalFrame } from "./modal-frame";
import { PortfolioContent } from "./portfolio-content";
import { PortfolioHeader } from "./portfolio-header";
import { ImageViewer } from "./image-viewer";
import { VideoPhotoModal } from "./video-photo-modal";
import { DEFAULT_MEDIA, NAV_ITEMS, type ModalState, type NavItem, type Project, type SiteContent } from "./portfolio-types";

function CaseStudyModal({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<
    "caseStudy" | "designThinking" | "products" | "otherAssets"
  >("caseStudy");
  const [viewer, setViewer] = useState<{ src: string; alt: string } | null>(null);
  const tabOrder = [
    "caseStudy",
    ...(project.designThinking ? ["designThinking" as const] : []),
    "products",
    "otherAssets",
  ] as const;

  const handleTabKey = (
    event: KeyboardEvent<HTMLButtonElement>,
    current: "caseStudy" | "designThinking" | "products" | "otherAssets",
  ) => {
    const currentIndex = tabOrder.indexOf(current);
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % tabOrder.length;
    if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + tabOrder.length) % tabOrder.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = tabOrder.length - 1;
    if (nextIndex === null) return;
    event.preventDefault();
    const next = tabOrder[nextIndex];
    setTab(next);
    document.getElementById(`${project.slug}-${next}-tab`)?.focus();
  };

  const closeTopLevel = () => {
    if (viewer) {
      setViewer(null);
      return;
    }
    onClose();
  };

  return (
    <ModalFrame
      title={project.caseStudy?.title || project.title}
      onClose={closeTopLevel}
      wide
    >
      <div className="modalTabs" role="tablist" aria-label="Case study tabs">
        {tabOrder.map((key) => {
          const label = {
            caseStudy: "Case Study",
            designThinking: "Design Thinking",
            products: "Products",
            otherAssets: "Other Assets",
          }[key];
          return (
            <button
              key={key}
              id={`${project.slug}-${key}-tab`}
              type="button"
              className={`modalTab ${tab === key ? "isActive" : ""}`}
              role="tab"
              aria-selected={tab === key}
              aria-controls={`${project.slug}-${key}-panel`}
              tabIndex={tab === key ? 0 : -1}
              onClick={() => setTab(key)}
              onKeyDown={(event) => handleTabKey(event, key)}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div
        id={`${project.slug}-${tab}-panel`}
        className="caseStudyContent"
        role="tabpanel"
        aria-labelledby={`${project.slug}-${tab}-tab`}
        tabIndex={0}
      >
        {tab === "caseStudy" && (
          <CaseStudySections sections={project.caseStudy?.sections ?? []} />
        )}
        {tab === "designThinking" && project.designThinking && (
          <>
            <h3 className="caseStudyPinnedHeading">{project.designThinking.heading}</h3>
            <CaseStudySections sections={project.designThinking.sections ?? []} />
          </>
        )}
        {tab === "products" && (
          <AssetGroups data={project.products} kind="products" onImageOpen={setViewer} />
        )}
        {tab === "otherAssets" && (
          <AssetGroups data={project.otherAssets} kind="otherAssets" onImageOpen={setViewer} />
        )}
      </div>
      {viewer && (
        <ImageViewer image={viewer} onClose={() => setViewer(null)} />
      )}
    </ModalFrame>
  );
}

function CaseStudySections({ sections }: { sections: any[] }) {
  return sections.map((section) => (
    <details key={section.heading} className="caseStudySection" open>
      <summary>{section.heading}</summary>
      <div className="caseStudyBody">
        {(section.body ?? []).map((item: any, index: number) =>
          typeof item === "string" ? (
            <p key={index}>{item}</p>
          ) : (
            <div key={index}>
              {item.text && <p>{item.text}</p>}
              {Array.isArray(item.sub) && (
                <ul>{item.sub.map((point: string) => <li key={point}>{point}</li>)}</ul>
              )}
            </div>
          ),
        )}
      </div>
    </details>
  ));
}

function AssetGroups({
  data,
  kind,
  onImageOpen,
}: {
  data: any;
  kind: "products" | "otherAssets";
  onImageOpen: (image: { src: string; alt: string }) => void;
}) {
  if (!data) return null;
  return (
    <div className="assetGroups">
      {data.heading && <p className="caseStudyPinnedHeading">{data.heading}</p>}
      {(data.groups ?? []).map((group: any, groupIndex: number) => (
        <section className="assetGroup" key={group.key ?? groupIndex}>
          {group.title && <h3>{group.title}</h3>}
          {group.desc && <p>{group.desc}</p>}
          <div className="assetGrid">
            {(group.items ?? []).map((item: any, index: number) => {
              const image = item.thumbKey && (
                <img src={item.thumbKey} alt={item.alt || item.label || "Project asset"} />
              );
              return (
                <article className="assetCard" key={item.href || item.label || index}>
                  {item.label && <h4>{item.label}</h4>}
                  {item.desc && <p>{item.desc}</p>}
                  {kind === "products" && item.href ? (
                    <a href={item.href} target="_blank" rel="noreferrer">{image}</a>
                  ) : item.thumbKey ? (
                    <button
                      type="button"
                      onClick={() => onImageOpen({
                        src: item.thumbKey,
                        alt: item.alt || item.label || "Project asset",
                      })}
                    >
                      {image}
                    </button>
                  ) : null}
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

export function PortfolioHome({ content }: { content: SiteContent }) {
  const projects = content.projects;
  const [menuOpen, setMenuOpen] = useState(false);
  const [modal, setModal] = useState<ModalState>(null);

  const openNavigationItem = (item: NavItem) => {
    setModal(item === "Video/Photo" ? { kind: "videoPhoto" } : { kind: "info", item });
  };

  useEffect(() => {
    if (modal?.kind !== "messageSent") return;

    const timer = window.setTimeout(() => {
      setModal(null);
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [modal]);

  useEffect(() => {
    if (!menuOpen || modal) return;
    const closeMenu = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", closeMenu);
    return () => document.removeEventListener("keydown", closeMenu);
  }, [menuOpen, modal]);

  return (
    <div className="portfolioShell min-h-screen flex flex-col p-7 max-[650px]:min-h-dvh max-[650px]:p-4">
      <a className="skipLink" href="#portfolio-content">Skip to selected work</a>
      <PortfolioHeader
        menuOpen={menuOpen}
        onMenuToggle={() => setMenuOpen((open) => !open)}
        items={content.navigation ?? NAV_ITEMS}
        onNavigate={openNavigationItem}
      />
      <PortfolioContent
        projects={projects}
        onProjectOpen={(project) => setModal({ kind: "caseStudy", project })}
      />

      {modal?.kind === "videoPhoto" && (
        <VideoPhotoModal media={content.media ?? DEFAULT_MEDIA} onClose={() => setModal(null)} />
      )}
      {modal?.kind === "info" && (
        <ModalFrame
          title={modal.item}
          onClose={() => setModal(null)}
          wide={modal.item === "Certifications"}
          compact={modal.item === "Contact"}
          initialFocusSelector={modal.item === "Contact" ? 'input[name="name"]' : undefined}
        >
          <div className={`modalContent modalContent${modal.item}`}>
            <InfoContent
              item={modal.item}
              onSent={() => setModal({ kind: "messageSent" })}
            />
          </div>
        </ModalFrame>
      )}
      {modal?.kind === "messageSent" && (
        <ModalFrame
          title="Message Sent"
          onClose={() => setModal(null)}
          panelClassName="modalPanelMessageSent"
        >
          <div className="messageSent" role="status">
            <h2>Message Sent</h2>
            <p>Thank you. I’ll get back to you soon.</p>
          </div>
        </ModalFrame>
      )}
      {modal?.kind === "caseStudy" && (
        <CaseStudyModal
          project={modal.project}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
