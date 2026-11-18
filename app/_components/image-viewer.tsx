/* eslint-disable @next/next/no-img-element */

import { useRef, useState } from "react";
import { createPortal } from "react-dom";

export function ImageViewer({
  image,
  onClose,
}: {
  image: { src: string; alt: string };
  onClose: () => void;
}) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  function handleImageLoad(event: React.SyntheticEvent<HTMLImageElement>) {
    const element = event.currentTarget;
    const isMobile = window.matchMedia("(max-width: 650px)").matches;
    const isLandscape = element.naturalWidth > element.naturalHeight;

    setRotation(isMobile && isLandscape ? 90 : 0);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }

  function handlePointerDown(event: React.PointerEvent<HTMLImageElement>) {
    event.stopPropagation();
    if (scale === 1) return;

    lastPoint.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLImageElement>) {
    if (!lastPoint.current || scale === 1) return;

    const dx = event.clientX - lastPoint.current.x;
    const dy = event.clientY - lastPoint.current.y;

    setPosition((current) => ({
      x: current.x + dx,
      y: current.y + dy,
    }));
    lastPoint.current = { x: event.clientX, y: event.clientY };
  }

  function handlePointerUp(event: React.PointerEvent<HTMLImageElement>) {
    lastPoint.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function handleDoubleClick() {
    setScale((current) => (current === 1 ? 1.4 : 1));
    setPosition({ x: 0, y: 0 });
  }

  return createPortal(
    <div
      className="imageViewerOverlay"
      onMouseDown={(event) => {
        event.stopPropagation();
      }}
      onClick={(event) => {
        event.stopPropagation();
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="imageViewer"
        role="dialog"
        aria-modal="true"
        aria-label={image.alt}
        onMouseDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="imageViewerInstructions" aria-live="polite">
          {/* <span aria-hidden="true">{scale === 1 ? "+" : "−"}</span> */}
          Double-tap to zoom in and out
        </div>
        <button type="button" onClick={onClose} aria-label="Close image viewer">✕</button>
        <div className="imageViewerWrap" style={{ containerType: "size" }}>
          <img
            className={`zImg${rotation ? " zImgRotated" : ""}`}
            src={image.src}
            alt={image.alt}
            draggable={false}
            onLoad={handleImageLoad}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onDoubleClick={handleDoubleClick}
            onClick={(event) => event.stopPropagation()}
            style={{
              flex: "none",
              width: "auto",
              height: "auto",
              // The available width and height swap when the image rotates.
              maxWidth: rotation ? "100cqh" : "100cqw",
              maxHeight: rotation ? "100cqw" : "100cqh",
              objectFit: "contain",
              transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg) scale(${scale})`,
              transformOrigin: "center",
            }}
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}
