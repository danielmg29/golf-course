---
target: homepage (app/(marketing)/page.tsx)
total_score: 23
max_score: 36
na_heuristics: 7
p0_count: 1
p1_count: 3
target_identity: "file:C:\\Users\\ddant\\OneDrive\\Documents\\Web Projects\\Work\\golf-course\\app\\(marketing)\\page.tsx"
target_fingerprint: "sha256:d06d08ec8f861d2fdb5ff2b215e5bb60f3669c3873e7712cd2a36ae7ed6496bc"
target_path: "C:\\Users\\ddant\\OneDrive\\Documents\\Web Projects\\Work\\golf-course\\app\\(marketing)\\page.tsx"
timestamp: 2026-11-05T20-46-15Z
slug: app-marketing-page-tsx
---
# Critique: homepage `/` (app/(marketing)/page.tsx)

Method: dual-agent (A: design-review sub-agent, B: detector sub-agent). B returned first; the parent saw detector output before A, but A never saw it.

## Design Health Score
| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of system status | 2 | "Live" leaderboard ticks on sample data; hours photo changes on hover only, hidden below lg |
| 2 | Match with the real world | 3 | Plain warm copy; "Toptracer", "Captain's Drive-In" are insider terms; no KES |
| 3 | User control and freedom | 3 | No scroll-jacking; Esc closes menu and popovers |
| 4 | Consistency and standards | 2 | Three labels for membership, three for booking |
| 5 | Error prevention | 3 | Honest DemoNotes; "Live" pulse can mislead |
| 6 | Recognition over recall | 3 | All 8 pages behind a hamburger at 1440 |
| 7 | Flexibility and efficiency | n/a | Marketing page |
| 8 | Aesthetic and minimalist design | 2 | Nine near-equal sections, about 8,800 px; repeated line |
| 9 | Error recovery | 3 | CourseFigures renders nothing if the read fails |
| 10 | Help and documentation | 2 | Caddie FAQ icon-only, hidden over hero, no WhatsApp number |
| Total | | 23/36 | Acceptable (64%) |

## Design Specificity Verdict
Well made but category-interchangeable (hero over golden-hour fairway + Apply, "Quiet by design" strip, amenity tiles, silhouette closing band). The brief's concept is absent: no decision language in the rendered text, none of the four stages exist. Specific to this club: Panorama skyline, "Pick your hour", Kenyan leaderboard names.
Detector: CLI 0 findings. Browser on /: undersized-ui-text x2 (Crest "Golf club" 7px, primitives.tsx:188, real), hero-eyebrow-chip x1 (wording false positive; repeated eyebrow+heading flattening is real), overused-font (Plus Jakarta Sans 67%, dismissed: pinned by the brand). Other pages: MpesaCheckout placeholder 3.6:1; /amenities h1 to h3 skip.

## Priority Issues
- [P0] The concept is missing (blocks the brief). Fix: four-act story; Act II terrain is the real course from terrainHeight(). overdrive, clarify.
- [P1] No through-line: eight blocks, alternating reserve/charcoal bands, fades only; gold is decoration. Fix: one world canvas, one master timeline, gold axis as structure. overdrive, animate.
- [P1] Boxed layout: 6 of 9 sections in the 1320px container. Fix: full-bleed acts, overlapping parallax plates. layout.
- [P1] Kenya and conversion thin: M-Pesa once in small grey text, KES only in hidden caddie panel, northern-hemisphere photos, up to 5 CTAs under 6 labels. Fix: one primary CTA per act, M-Pesa ring finale, consistent labels, Kenyan photography. clarify, distill.
- [P2] Above-the-fold text hidden until GSAP (4s CSS fallback); late hydration replays the reveal (hero heading half-masked ~15s after load). Fix: server-visible hero text, skip entrances already shown. harden.

## Persona Red Flags
- Jordan: private vs "anyone who books ahead" vs day pass; no price or joining step.
- Riley: hero replay; "Presenting partner" placeholder; WhatsApp link without number.
- Casey: first screen blank up to 4s; 30 images; Panorama side windows 32px at 375px; hours photo lost on phone; caddie button covered "All amenities".
- Time-poor founder: no network, tiers, scarcity or business use in 10s; corporate golf days is row 4 of 7.

## Minor Observations
Empty lower third of hero at 1440x900; 11px gold eyebrow on photo hard to read; hours photo stuck on 06:30 for touch; best line buried in footer; /amenities heading skip and placeholder contrast.

## Questions to Consider
- Without "golf", what sentence tells a Nairobi founder why this place matters to their next deal?
- Why is the topographic map on page two instead of Act II?
- Private or pay-and-play: which promise wins an application?

Roadmap: docs/next-move-roadmap.md
