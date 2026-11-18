/* eslint-disable @next/next/no-img-element */

import { useState, type KeyboardEvent } from "react";
import { ImageViewer } from "./image-viewer";
import { ModalFrame } from "./modal-frame";
import { type MediaPhoto, type PortfolioMedia } from "./portfolio-types";
import { youtubeVideoId } from "./youtube-video";
import { mediaCategories, mediaCategoryKey } from "./media-categories";
import styles from "./video-photo-modal.module.css";

const mediaTabs = ["Video", "Photo"] as const;
export function VideoPhotoModal({ media: { videos, photos }, onClose }: { media: PortfolioMedia; onClose: () => void }) {
  const [tab, setTab] = useState<(typeof mediaTabs)[number]>("Video");
  const [categoryByTab, setCategoryByTab] = useState({ Video: "", Photo: "" });
  const categories = mediaCategories(tab === "Video" ? videos : photos);
  const category = categoryByTab[tab];
  const visibleVideos = videos.filter((video) => !category || mediaCategoryKey(video.category) === category);
  const visiblePhotos = photos.filter((photo) => !category || mediaCategoryKey(photo.category) === category);
  const [viewer, setViewer] = useState<MediaPhoto | null>(null);

  function handleTabKey(event: KeyboardEvent<HTMLButtonElement>) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;

    event.preventDefault();
    const next = event.key === "Home" || (event.key !== "End" && tab === "Photo")
      ? "Video"
      : "Photo";
    setTab(next);
    document.getElementById(`media-${next}-tab`)?.focus();
  }

  return (
    <ModalFrame title="Video/Photo" wide onClose={() => viewer ? setViewer(null) : onClose()}>
      <div className="modalTabs" role="tablist" aria-label="Portfolio media">
        {mediaTabs.map((name) => (
          <button
            key={name}
            id={`media-${name}-tab`}
            type="button"
            role="tab"
            className={`modalTab ${tab === name ? "isActive" : ""}`}
            aria-selected={tab === name}
            aria-controls={`media-${name}-panel`}
            tabIndex={tab === name ? 0 : -1}
            onClick={() => setTab(name)}
            onKeyDown={handleTabKey}
          >
            {name}
          </button>
        ))}
      </div>
      {categories.length > 0 && (
        <label className={styles.categoryFilter}>
          <span>Category</span>
          <select
            value={category}
            onChange={(event) => {
              const value = event.target.value;
              setCategoryByTab((current) => ({ ...current, [tab]: value }));
            }}
          >
            <option value="">All categories</option>
            {categories.map(({ key, label }) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </label>
      )}
      <div
        id="media-Video-panel"
        className="caseStudyContent"
        role="tabpanel"
        aria-labelledby="media-Video-tab"
        hidden={tab !== "Video"}
        tabIndex={0}
      >
        {tab === "Video" && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,340px),360px))] items-start gap-4">
            {visibleVideos.length === 0 && <p>No videos published yet.</p>}
            {visibleVideos.map(({ url, title }) => {
              const id = youtubeVideoId(url);
              if (!id) return null;
              return (
                <div key={url}>
                  <iframe
                    className="aspect-video w-full rounded-lg"
                    src={`https://www.youtube-nocookie.com/embed/${id}`}
                    title={title}
                    loading="lazy"
                    allowFullScreen
                  />
                  <a className="underline" href={`https://www.youtube.com/watch?v=${id}`}>
                    Watch {title} on YouTube
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div
        id="media-Photo-panel"
        className={styles.photoPanel}
        role="tabpanel"
        aria-labelledby="media-Photo-tab"
        hidden={tab !== "Photo"}
        tabIndex={0}
      >
        {tab === "Photo" && (visiblePhotos.length ? (
          <ul className={styles.photoGrid}>
            {visiblePhotos.map((photo) => (
              <li key={photo.id}>
                <button
                  type="button"
                  className={styles.photoTile}
                  aria-haspopup="dialog"
                  onClick={() => setViewer(photo)}
                >
                  <img src={photo.src} alt={photo.alt} loading="lazy" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>Photography coming soon.</p>
        ))}
      </div>
      {viewer && <ImageViewer image={viewer} onClose={() => setViewer(null)} />}
    </ModalFrame>
  );
}
