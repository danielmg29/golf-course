import type { Metadata } from "next";
import Link from "next/link";
import { LippedOut } from "@/components/feedback/ErrorArt";
import { ErrorScene } from "@/components/feedback/ErrorScene";
import { TextLink } from "@/components/ui/primitives";
import { button } from "@/lib/variants";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <ErrorScene
      code="404"
      name="Page not found"
      art={<LippedOut />}
      title={
        <>
          Lipped out. <em>That page isn&apos;t on the course.</em>
        </>
      }
      body="It may have moved, or the link had a typo. Take it from the first tee, or go straight to what most people come for."
      actions={
        <>
          <Link href="/" className={button({ tone: "gold" })}>
            Back to the first tee
          </Link>
          <TextLink href="/book">Book a tee time</TextLink>
          <TextLink href="/course">See the course</TextLink>
        </>
      }
    />
  );
}
