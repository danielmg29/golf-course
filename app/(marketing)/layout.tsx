import { FloatingActions } from "@/components/layout/FloatingActions";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { World } from "@/components/world/World";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Here rather than in a page, so the one WebGL canvas survives navigation. */}
      <World />
      <SiteHeader />
      {children}
      <SiteFooter />
      <FloatingActions />
    </>
  );
}
