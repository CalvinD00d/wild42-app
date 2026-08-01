"use client";

import { type ReactNode, useEffect, useId, useRef } from "react";

export function ModalFrame({
  title,
  children,
  onClose,
  wide = false,
  compact = false,
  panelClassName = "",
  initialFocusSelector,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
  compact?: boolean;
  panelClassName?: string;
  initialFocusSelector?: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const initialFocusTarget = initialFocusSelector
      ? panelRef.current?.querySelector<HTMLElement>(initialFocusSelector)
      : null;
    (initialFocusTarget ?? panelRef.current)?.focus({ preventScroll: true });

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'button, a[href], input, textarea, select, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.hasAttribute("disabled"));
      if (!focusable.length) {
        event.preventDefault();
        panelRef.current.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.body.style.overflow = bodyOverflow;
      previous?.focus({ preventScroll: true });
    };
  }, [initialFocusSelector, onClose]);

  return (
    <div className="modalBackdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <div
        ref={panelRef}
        className={`modalPanel ${wide ? "modalPanelWide" : ""} ${compact ? "modalPanelContact" : ""} ${panelClassName}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <div className="modalScrollRegion">
          <div className="modalStickyHeader">
            <div className="modalTitleRow">
              <button type="button" className="modalClose" onClick={onClose} aria-label="Close modal">✕</button>
              <h2 id={titleId}>{title}</h2>
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
