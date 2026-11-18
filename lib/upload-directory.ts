import "server-only";

import path from "node:path";

export function uploadDirectory() {
  return process.env.PORTFOLIO_UPLOAD_DIR ||
    path.join(/* turbopackIgnore: true */ process.cwd(), "public", "uploads");
}
