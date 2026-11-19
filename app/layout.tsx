import type { Metadata } from "next";
import "./tailwind.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://wild42.com"),
  title: {
    default: "Calvin McWilliams | UX/UI Engineer",
    template: "%s | Calvin McWilliams",
  },
  description:
    "The UX engineering, frontend development, and design portfolio of Calvin McWilliams.",
  keywords: [
    "Calvin McWilliams",
    "UX engineer",
    "UX designer",
    "UI designer",
    "frontend developer",
    "Austin",
  ],
  authors: [{ name: "Calvin McWilliams", url: "https://wild42.com" }],
  creator: "Calvin McWilliams",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    title: "Calvin McWilliams | UX/UI Engineer",
    description:
      "UX engineering, frontend development, and design portfolio.",
    siteName: "Wild42Media",
  },
  twitter: {
    card: "summary",
    title: "Calvin McWilliams | UX/UI Engineer",
    description:
      "UX engineering, frontend development, and design portfolio.",
  },
  icons: {
    icon: "/vite.svg",
    shortcut: "/vite.svg",
  },
  other: {
    "codex-preview": "development",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Calvin McWilliams",
  url: "https://wild42.com",
  jobTitle: "UX/UI Engineer",
  sameAs: ["https://www.linkedin.com/in/calvin-mcwilliams/"],
  knowsAbout: [
    "User experience design",
    "User interface design",
    "Frontend development",
    "React",
    "Accessibility",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
        />
      </head>
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </body>
    </html>
  );
}
