import type { SiteContent } from "@/app/_components/portfolio-types";

declare global {
  var __broadcastContentUpdate: ((content: SiteContent) => void) | undefined;
}

export function broadcastContentUpdate(content: SiteContent) {
  globalThis.__broadcastContentUpdate?.(content);
}
