import type { Metadata, Viewport } from "next";
import { Loader, loaderGate } from "@/components/feedback/Loader";
// Imported for its check: a bad environment value fails the build.
import "@/lib/env";
import { site } from "@/lib/site";
import { fontVariables } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: site.fullName, template: `%s | ${site.fullName}` },
  description: `Eighteen holes, a clubhouse and a long evening in ${site.place}. Book a tee time, join the club or plan a company golf day.`,
};

export const viewport: Viewport = {
  themeColor: "#102f25",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // The loader's gate sets data-loader on <html> before React hydrates, hence the suppression.
    <html lang="en" suppressHydrationWarning className={`${fontVariables} h-full antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: loaderGate }} />
      </head>
      <body className="flex min-h-full flex-col">
        {children}
        <Loader />
      </body>
    </html>
  );
}
