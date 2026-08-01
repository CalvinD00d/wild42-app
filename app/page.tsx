import { PortfolioHome } from "./_components/portfolio-home";
import { readPublicContent } from "@/lib/content-store";

export const dynamic = "force-dynamic";

export default async function Home() {
  const content = await readPublicContent();
  return <PortfolioHome content={content} />;
}
