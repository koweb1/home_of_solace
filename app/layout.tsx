import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import Loader from "@/components/layout/Loader";
import Nav from "@/components/layout/Nav";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT"],
  variable: "--font-fraunces",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "House of Solace | Resort in Lagos",
  description:
    "House of Solace is a quiet resort in Lagos. Slow mornings, warm evenings, and a room that feels like yours. Request your stay.",
  openGraph: {
    title: "House of Solace | Resort in Lagos",
    description:
      "A quiet resort in Lagos. Request your stay at House of Solace.",
    type: "website",
    locale: "en_NG",
    siteName: "House of Solace",
  },
};

export const viewport: Viewport = {
  themeColor: "#0E1433",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body>
        <Loader />
        <Nav />
        {children}
        <div className="grain" aria-hidden="true" />
      </body>
    </html>
  );
}