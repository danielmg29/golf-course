# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Prospective members: Kenyan corporate executives, tech founders and high-net-worth individuals deciding whether a private golf club is worth applying to. They are time-poor, already belong to other clubs, and judge quickly, often on a phone.

## Product Purpose

A show-and-tell website for a private golf club in Kenya, built to demonstrate the features in the club's roadmap and to practise the Adaptive Convergence v2 UI method (chapter 6 of the manual). Success is a prospective member understanding what the club offers and applying for membership.

## Positioning

Golf plus a network: a private course where decision-makers from different industries meet, rather than a sports club for golfers only. The golf is the shared ritual; the people it brings together are the reason to join.

## Operating Context

- Visitors are in Kenya, mostly on mid-range Android phones over mobile data, so data cost and load time matter.
- Payments are M-Pesa and prices are in Kenyan shillings (KES).
- Membership is applied for, not bought: the application is reviewed by the club.

## Capabilities and Constraints

- Built: a 3D map of the course, a tee sheet with an M-Pesa checkout, floodlit simulator bays, a guest day pass, a corporate golf-day builder, a stay-and-play packager, a member directory, a four-ball finder, a membership application, events and a leaderboard.
- Every booking and payment flow is a browser demo: nothing is charged, sent or stored, and receipts are marked as samples.
- Stack: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Three.js, GSAP, Prisma 7 with Neon PostgreSQL.
- Undecided: the club's real name, address, WhatsApp number and membership prices.

## Brand Commitments

- "The Reserve" is a working name only, set by `NEXT_PUBLIC_APP_NAME`.
- The whole site follows the owner's design blueprint "Beyond the 18th": the homepage since 2026-11-06, and every other page, the header, footer, loading screen and error pages since 2026-11-07. Its palette is binding: Forest #102F25, Club green #214A39, Antique gold #B89556, Warm ivory #E8DFCD, Charcoal #252A25, Sage #52705C, Off-white #F5F1E9 and Stone #777E76. So are Cormorant Garamond with Manrope. Antique gold is for the fairway line, accents and the primary action only.
- The earlier binding colours (Deep Reserve Green `#061F14`, Raw Alabaster, Brushed Champagne Gold, Charcoal Slate) are retired. Their token names in `globals.css` now carry the blueprint's values.
- "Beyond the 18th" is the blueprint's title, not the club's name. Copy beyond the blueprint's own lines is a draft awaiting approval. So are the heritage dates, events and itineraries, which are labelled samples.

## Evidence on Hand

- None of it is real. The club name, course data (`prisma/seed-data.ts`), prices, people, scores and photos (Unsplash stock, `lib/photos.ts`) are placeholders.
- There are no members, testimonials, press, partners or membership numbers. Never invent them or present sample data as fact; label demonstrations as samples.

## Product Principles

1. **Show the club, don't claim it.** Let the course, the place and the working tools make the case; label every sample.
2. **Membership first.** Every page should lead a prospective member towards applying; booking a round supports that, never competes with it.
3. **Phones on mobile data are the main screen.** Nothing heavy loads before the content, and nothing essential depends on 3D.
4. **Kenya is part of the product.** M-Pesa, shillings and local places are features, not decoration.
5. **Speak to decision-makers without business jargon.** The network is shown through the people and rituals, never through words like "synergy" or "ROI".

## Accessibility & Inclusion

Reduced-motion visitors get the full content without scroll-driven animation; every story and tool works from the keyboard; text meets WCAG AA contrast.
