"use client";

import { useEffect } from "react";

/**
 * The site's header and floating buttons were drawn for dark grounds. Two thin bands, one at
 * the top of the screen and one at the foot, watch which band of the page they are over
 * (data-tone="light" or "dark") and set <html data-header-tone> and <html data-float-tone>, so
 * globals.css can turn them dark-on-light over ivory and paper. Over grounds marked
 * data-floating="hide", and over the footer, the floating buttons step aside instead.
 */
export function useGroundTone() {
  useEffect(() => {
    const html = document.documentElement;
    const grounds = [...document.querySelectorAll<HTMLElement>("[data-tone], [data-floating='hide'], footer")];

    const band = (rootMargin: string, key: "headerTone" | "floatTone", hides: boolean) => {
      const inside = new Set<HTMLElement>();
      const decide = () => {
        const present = [...inside];
        if (hides && present.some((element) => element.dataset.floating === "hide" || element.tagName === "FOOTER")) {
          html.dataset[key] = "hide";
          return;
        }
        // The innermost ground wins: the one that sits latest in the document.
        const tone = present
          .filter((element) => element.dataset.tone)
          .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1))
          .at(-1)?.dataset.tone;
        if (tone) html.dataset[key] = tone;
        else delete html.dataset[key];
      };
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const element = entry.target as HTMLElement;
            if (entry.isIntersecting) inside.add(element);
            else inside.delete(element);
          }
          decide();
        },
        { rootMargin },
      );
      grounds.forEach((element) => observer.observe(element));
      return observer;
    };

    const top = band("0px 0px -94% 0px", "headerTone", false);
    const foot = band("-94% 0px 0px 0px", "floatTone", true);
    return () => {
      top.disconnect();
      foot.disconnect();
      delete html.dataset.headerTone;
      delete html.dataset.floatTone;
    };
  }, []);
}
