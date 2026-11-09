---
name: The Reserve (Beyond the 18th)
description: A private Kenyan golf club told as one day in eight chapters, on a strict Swiss grid, carried by a single antique-gold fairway line.
colors:
  forest: "#102f25"
  forest-deep: "#0c271e"
  footer-ground: "#0b241b"
  club: "#214a39"
  antique: "#b89556"
  champagne: "#c9a86c"
  bronze: "#7a5f2c"
  bronze-deep: "#694f22"
  ivory: "#e8dfcd"
  paper: "#f5f1e9"
  paper-panel: "#ebe3d3"
  coal: "#252a25"
  ink-on-light: "#1f241f"
  sage: "#52705c"
  stone: "#777e76"
  destructive: "#e5806f"
  success: "#8fbf9f"
typography:
  display-xl:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(3.375rem, 2.214rem + 4.762vw, 6.5rem)"
    fontWeight: 300
    lineHeight: 0.96
    letterSpacing: "-0.012em"
  display-lg:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(2.75rem, 2.007rem + 3.048vw, 4.75rem)"
    fontWeight: 300
    lineHeight: 1
    letterSpacing: "-0.012em"
  h1:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(2.375rem, 1.864rem + 2.095vw, 3.75rem)"
    fontWeight: 300
    lineHeight: 1.04
  h2:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(2rem, 1.721rem + 1.143vw, 2.75rem)"
    fontWeight: 300
    lineHeight: 1.08
  h3:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(1.5rem, 1.407rem + 0.381vw, 1.75rem)"
    fontWeight: 400
    lineHeight: 1.2
  lead:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "clamp(1.0625rem, 1.039rem + 0.095vw, 1.125rem)"
    fontWeight: 400
    lineHeight: 1.6
  body:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "0.005em"
  action:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1
  meta:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.06em"
    fontFeature: "tnum, lnum"
  label:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.04em"
    fontFeature: "tnum, lnum"
  figure:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 1.407rem + 0.381vw, 1.75rem)"
    fontWeight: 300
    lineHeight: 1
    fontFeature: "tnum, lnum"
rounded:
  none: "0px"
  full: "9999px"
spacing:
  gutter-phone: "16px"
  gutter-tablet: "20px"
  gutter-desktop: "24px"
  margin-phone: "20px"
  margin-tablet: "32px"
  margin-desktop-left: "112px"
  margin-desktop-right: "48px"
  margin-wide: "64px"
  rail: "72px"
  band-y: "96px"
  band-y-md: "128px"
  hairline: "1px"
  line-gold: "3px"
components:
  button-primary-dark:
    backgroundColor: "{colors.antique}"
    textColor: "{colors.forest}"
    typography: "{typography.action}"
    rounded: "{rounded.none}"
    height: "48px"
    padding: "0 24px"
  button-primary-dark-hover:
    backgroundColor: "{colors.champagne}"
    textColor: "{colors.forest}"
  button-primary-light:
    backgroundColor: "{colors.forest}"
    textColor: "{colors.paper}"
    typography: "{typography.action}"
    rounded: "{rounded.none}"
    height: "48px"
    padding: "0 24px"
  button-primary-light-hover:
    backgroundColor: "{colors.club}"
    textColor: "{colors.paper}"
  button-header:
    backgroundColor: "{colors.antique}"
    textColor: "{colors.forest}"
    typography: "{typography.action}"
    rounded: "{rounded.none}"
    height: "44px"
    padding: "0 20px"
  text-link:
    textColor: "{colors.paper}"
    typography: "{typography.action}"
    padding: "0 0 4px 0"
  field:
    textColor: "{colors.paper}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    height: "52px"
  progress-stop:
    backgroundColor: "{colors.antique}"
    rounded: "{rounded.full}"
    size: "11px"
---

# Design System: The Reserve (Beyond the 18th)

## Overview

**Creative North Star: "The Fairway Line"**

The site is one day at a private club, told in numbered chapters on a strict Swiss grid. Deep forest bands carry the scenes and the working tools; warm ivory and off-white bands carry the reading. A single fine antique-gold line, a hairline with a three-pixel gold stretch, runs through every page. It is the hero's ball flight, each section's rule, the timeline, the plan, the progress bar, the rail and the footer. Typography is light and literary at display sizes (Cormorant Garamond, weight 300, flush left) and plain and functional everywhere else (Manrope). Photographs are authentic landscape, full-bleed, under a forest overlay.

Density is low and editorial: wide bands (96 to 128px of vertical padding), headings set from column 3 of the 12-column grid, copy kept to 40 to 48ch. Surfaces are flat. Depth comes from photography, overlays and one WebGL world, never from shadows on panels. Motion is GSAP, driven by data attributes on server-rendered markup. Every motion has a still end state, so the site reads fully with scripts off or reduced motion on.

The world rejects the luxury template of a photo hero over a row of equal cards, gold everywhere, glass decoration, cards for their own sake, and kickers or eyebrows over headings.

**Key Characteristics:**
- Forest and ivory or paper bands alternating dark and light, full-bleed.
- One antique-gold fairway line, hairline plus 3px gold, as the site's only transition grammar.
- Cormorant Garamond Light at display sizes, flush left, with balanced wrapping; Manrope for every functional word.
- Tabular, lining figures for every time, price, yardage and score.
- Square-edged actions; circles are kept for the ball: the stops, the ring, the cup and the stepper.
- A flagstick rail on wide screens that carries the page's progress and section name.
- Scroll-driven 3D that draws only when something moves, with a poster fallback.

## Colors

The blueprint's palette is binding: a deep forest ground, warm paper grounds, and one antique gold kept scarce.

### Primary
- **Antique Gold** (antique): the fairway line, the primary action on dark grounds, the menu's current page, link underlines and the ball's print. It is never used for body text or large fills.
- **Champagne** (champagne): the hover state of the antique primary, and nothing else.

### Secondary
- **Club Green** (club): the hover state of the forest primary on light grounds, and the `club` chapter tone. It marks interaction, not decoration.

### Tertiary
- **Bronze** (bronze): antique gold re-inked for light grounds, so it holds 4.5:1 on ivory. On ivory and paper bands, gold text, gold rules and gold borders all resolve to bronze. **Bronze Deep** (bronze-deep) is its hover.

### Neutral
- **Forest** (forest): the page ground, dark chapter bands, the menu sheet, the loader, the error pages, and the overlay over every photograph (rgb(16 47 37) at 0.5 to 0.96).
- **Forest Deep** (forest-deep): raised panels on dark grounds, one shade below the page.
- **Footer Ground** (footer-ground): the footer only, one step darker again, so the page ends lower than it began.
- **Warm Ivory** (ivory): the ground of light editorial bands.
- **Off-white Paper** (paper): type on dark grounds and the second light band. **Paper Panel** (paper-panel) is the panel inside a paper band.
- **Charcoal** (coal): text on light grounds, and the header and rail when they sit over light bands.
- **Ink on Light** (ink-on-light): what the `alabaster` text token becomes inside a light band.
- **Sage** (sage) and **Stone** (stone): present in the palette, with almost no 2D use. Stone is never used for text, because it fails contrast; muted text is charcoal or paper at reduced opacity.

**The Working-Names Rule.** Components are written once against the legacy token names, and those names now carry blueprint values: `reserve` is forest, `charcoal` is forest-deep, `alabaster` is paper, `gold` is antique, `champagne` is the gold hover. A light band (`band-light` on ivory, `band-paper` on paper) re-inks them: alabaster becomes ink-on-light, gold becomes bronze, champagne becomes bronze-deep, and reserve and charcoal become the light ground or panel. New components use the working names, so they read on either ground without variants.

**The Scarce Gold Rule.** Antique gold is for the fairway line, accents and the one primary action in a band. If gold is filling an area larger than a button, it is wrong.

**The Over-Imagery Rule.** Copy over a photograph or the 3D course always sits on a forest scrim (a linear gradient of rgb(16 47 37) from about 0.5 to 0.96, or 0.9 to transparent from the copy's side), never on a raw image.

## Typography

**Display Font:** Cormorant Garamond (with Georgia, serif), normal and italic
**Body Font:** Manrope (with system-ui, sans-serif)
**Label/Mono Font:** Manrope with tabular, lining numerals

**Character:** A light, high-contrast Garamond, set large and flush left, gives the literary voice. A plain geometric sans does all the work of navigation, forms and figures.

### Hierarchy
- **Display XL** (300, display-xl, 0.96): the H1 of the homepage hero and of each inner-page hero.
- **Display LG** (300, display-lg, 1): chapter headings, closing bands, error headings and the footer's last line.
- **H1** (300, h1, 1.04): editorial row headings and smaller chapter titles.
- **H2** (300, h2, 1.08): sub-sections. Timeline marks use the same size in Manrope ExtraLight.
- **H3** (400, h3, 1.2): timeline stop titles, footer column heads and menu-sheet heads.
- **Lead** (Manrope 400, lead, 1.6): the hero's supporting line, at most 40 to 48ch.
- **Body** (Manrope 400, 1rem, 1.7): running text in sentence case, at 84% of the text colour.
- **Meta / Label** (Manrope 600, 12px rising to 13 or 14px from 768px, 0.04 to 0.06em tracking): the chapter index, the hero info bar, captions and the rail's running head. Sentence case.
- **Figure** (Manrope 300, h3, tabular): figures on a hairline (holes, par, yards), set light.
- **Footer name** (Cormorant 300, clamp(4.5rem, 18.5vw, 21rem), 0.78): the club's name across the full width of the page, its first word in italic.

**The One Italic Rule.** Italics are kept for one phrase a page, inside its main heading. CSS sets `em` in section headings (`main h2`, `main h3`) upright, so authors may mark a phrase and only the hero's phrase leans. The club's own name (wordmark and footer) is the one standing exception.

**The Scorecard Figures Rule.** Every figure (time, price in KES, yardage, par, score, step count) is set in tabular, lining numerals. Cormorant's old-style default is switched off site-wide.

**The Sentence Case Rule.** Labels, metadata and running text are in sentence case. The only spaced capitals are the wordmark's "Golf club" line.

## Layout

**Grid.** A Swiss grid of 4 columns with 16px gutters on phones, 6 with 20px from 768px, and 12 with 24px from 1024px. Headings start at column 3 on desktop and span 8 or 9 columns. The left two columns hold the chapter index or stay empty. Editorial rows split a photograph across seven columns and words across four, alternating sides.

**Frame.** The frame is capped at 90rem. Its margins are 20px on phones and 32px on tablets. From 1024px they are 112px left and 48px right, so the content clears the 72px flagstick rail and the page reads asymmetrically, from the rail outward. Wide screens keep at least 64px on each side. Full-bleed rails line their first item up with the frame's content edge and snap there.

**Bands.** Sections are full-bleed bands alternating forest (dark: scenes and tools) with ivory or paper (light: reading). Bands carry 96px of vertical padding, and 128px from 768px. Homepage chapters add room at the top on phones so the index clears the header. Every band reports `data-tone` (dark or light), which the header, rail and floating buttons follow.

**Heroes.** Every page opens on a full-bleed photograph under a forest overlay (100svh, or 72svh for tool-first pages such as booking). The heading sits flush left at the foot, then the fairway line begins, with an info bar below it: the club's name, its place and any facts.

**The Asymmetric Frame Rule.** On wide screens the left margin is the rail plus a gutter (112px), never mirrored. Nothing sits under the rail.

## Elevation & Depth

Surfaces are flat. There are no shadows on panels, cards or buttons. Depth comes from three sources: photography under forest overlays; tonal steps of the ground (forest, then forest-deep panels, then the darker footer ground; ivory, then paper, then paper panel); and the WebGL world, which draws behind the content (z-index -10) or, for acts that draw over the page, above it but still under the header. A fixed film-grain layer (1.8% opacity) sits over everything without repainting.

### Shadow Vocabulary
- **Ball shadow** (`box-shadow: 0 2px 4px rgb(0 0 0 / 0.35)`): only on the small ball that rides the rail. Shadows belong to the ball, in 2D and 3D, cast by the light of the photograph it is over.

**The Flat Ground Rule.** A panel is separated by a tone step or a hairline, never by a shadow.

## Shapes

Every edge is square (0px): buttons, panels, photographs, fields and the menu sheet. Rules are a 1px hairline in the current colour at 15 to 25% opacity. Where the fairway line runs, a 3px gold bar sits on the hairline, offset 1px above it. Circles appear only where the ball does: timeline and progress stops (11px, 2px gold ring), the wordmark's ring, the ball on the rail, the cup at the rail's foot (an ellipse), and the stepper's round controls. Photographs crop to 4:5, 5:4, 7:5 and 8:5.

## Components

### Buttons
Square, solid and singular: one primary action per band.
- **Shape:** square edges (0px), 48px tall with 24px horizontal padding; Manrope 600 at 15px.
- **Primary on dark:** antique gold ground with forest text. On hover it moves to champagne over 200ms ease-out.
- **Primary on light:** forest ground with paper text. On hover it moves to club green.
- **Header action:** the same antique button at 40px on phones and 44px from 768px ("Book" on phones, "Book a tee time" from 768px).
- **Outline:** a 1px border in the text colour at 35% opacity, which turns gold on hover with a 10% gold wash.
- **Focus:** a 1px gold outline, offset 3px, everywhere. Active state scales to 0.98.

### Text Link
The secondary action. Its underline is a strand of the fairway line.
- Manrope 600 at 15px, with a 1px gold bottom border 4px below the text, followed by a 16px arrow in gold. The arrow steps 4px forward on hover. It sits beside a primary button, 32px apart.

### Section Rule
The fairway line at the top of a section: a hairline with a gold stretch (18% wide; 12% in the hero; full width in closing bands). It grows into place as it arrives. It shows no label: its `name` is read by the rail, which sets it along the page's progress. On the homepage the gold length is the story's progress, one eighth per chapter, with the chapter index ("01 — The invitation") in the first two columns beside the heading on desktop, and on the rule itself on phones.

### Progress Line and Timeline
- **Progress line:** steps on a hairline, gold as far as the current step, with 11px ring stops and a polite live region. Used by the membership application and the tee-sheet booking.
- **Timeline:** shared by About (heritage), Events (calendar) and Stay & Play (a week). It runs across the grid on desktop and down the left on phones. The gold grows with the scroll. Marks are in Manrope ExtraLight at h2 size, tabular.

### Figures
A row of label and value pairs on a hairline. The label is in meta style at 80%, the value in light tabular Manrope at h3 size. The course page and the homepage course stage use it for holes, par and yards.

### Inputs / Fields
- **Style:** transparent ground with a 1px gold bottom rule at 40% opacity, 52px tall, square, body size. Placeholders at 40% of the text colour.
- **Focus:** the bottom rule turns solid gold over 300ms; no ring or glow.
- **Choices:** a selected choice fills gold with forest text. Unselected choices carry a 15% border that warms to 60% gold on hover.

### Navigation
- **Flagstick rail** (from 1024px): fixed down the left edge, 72px wide, with a hairline right border. The menu button sits at the top. Below it the fairway line fills downward with scroll (3px antique over a hairline), while a ball rides its tip towards the cup at the foot. The current section's name runs vertically along it.
- **Top bar:** the crest (centred on phones, inline from 1024px), five main pages from 1280px with an antique underline that draws on hover and stays on the current page, an "Apply" text link and the antique booking button. It slides away on scroll down and returns on scroll up. Past 80px a forest shade fades in behind it; over light bands the shade turns ivory and the bar turns charcoal, with gold becoming bronze.
- **Menu sheet:** a full-screen forest dialog that wipes down (clip-path, 0.7s expo.inOut). The menu lines cross into an X. Every page appears large in Cormorant Light between hairlines; the current page is antique and italic, and the hovered page leans italic. Beside them: "Today at the club" hours as a tabular scorecard, quick bookings, WhatsApp, and a 4:5 photograph of the page you are pointing at. A quarter-length fairway line runs at its foot.

### Footer
The nineteenth hole, on the darker footer ground. It opens with the day's last line at display-lg and two actions (book, WhatsApp). Below are club notes, four columns (Explore, Book, Visit, Hours) under hairlines, and the samples notice. Then the fairway line runs at full length and hands over to the club's name, set across the whole width with a small antique ring as its ball.

### Loader
The putt before every page (owner's choice, 2026-11-09), with motion allowed. On a page's first load, a script in `<head>` marks the page before first paint. On a link inside the site, the screen rises over the page being left (clip-path, 0.45s), and only then does the next page load behind it. Back and forward get a putt too.

It is a forest screen with the wordmark, "Reading the green" in Cormorant italic, a Skip link (Escape also skips) and a fairway line filling with progress. Behind it a photoreal putt rolls towards the camera. It always plays out in full (2.4s). If the page isn't ready by then, the ball waits short of the cup and drops when it is (at most 8s more). The ball drops (0.35s) and the screen lifts by clip-path (0.7s).

The 3D scene loads once and stays, drawing only during a putt. With reduced motion it never shows. If scripts fail, CSS fades it by 12s and unlocks the scroll.

### Error Pages
The 404, route error and global error pages share one scene on forest, under a radial lift from the foot: the crest, an SVG illustration with some golf in it (404: the putt lips out; 500: into the pond; global: play suspended), a display-lg heading that owns the failure and names the next step, actions, and the error code on the fairway line. The illustrations are SMIL, so they run without script. Each also draws a still final frame for reduced motion.

### Signature: The Fairway Line
One motif, many forms, all drawn as a hairline with gold:
- **Homepage.** The hero ball is driven along the line's path and out of frame (the line itself is not drawn there). In 02 it drops out of the land photograph's sky onto its horizon line and rolls off the picture. In 03 it lands on hole 1 of the full-screen 3D course, and the line becomes the selected hole's route, a gold tube. In 04 it threads the day strip, with its progress bar. Each chapter rule fills one eighth more.
- **Inner pages.** Each hero starts the line, and each closing band runs it at full length. It becomes a timeline (About, Events, Stay & Play), a yardage-book plan whose hole lines turn gold on hover (Course), a connection network that draws itself (Membership), converging contact lines (Contact), and the progress line in booking and application.
- **Chrome.** The line also forms the rail, the loader's progress, the error code's rule, and the footer, where it runs in full into the club's name.

### Motion
Motion is GSAP only, defined in one place per page (the inner-page `Page` main and the homepage `HomeMotion`) and requested by data attributes, so the components that use it stay server components.
- **data-lines:** heading lines slide up out of masks (1.4s expo.out, 0.12s stagger).
- **data-fade:** fades in while rising 36px (1.2s power3.out).
- **data-rise:** children rise 24px, staggered by 0.08s.
- **data-clip / data-mask:** a photograph wipes open from the foot while its image settles from 1.12 to 1.2 scale.
- **data-rule:** a gold stretch grows from the left.
- **data-draw:** an SVG path draws in, or follows the scroll with data-scrub.
- **data-grow:** a line grows with the scroll, across ("x") or down ("y").
- **Also:** data-zoom, data-parallax and data-delay.

Duration tokens: instant 0.12s, fast 0.2s, standard 0.35s, editorial 0.65s, dramatic 1s, scene 1.4s. The CSS ease is cubic-bezier(0.32, 0.72, 0, 1). Reveals start at 85 to 92% of the viewport and play once.

Every element GSAP will reveal is hidden only under `(scripting: enabled) and (prefers-reduced-motion: no-preference)`, with a 4s CSS reveal as a fallback. The homepage hero's entrance runs in CSS, so it appears on first paint. Under reduced motion every scene shows its final composition.

### 3D
- **One world.** A single WebGL renderer lives in the layout behind every page and lasts the whole visit. Pages claim acts (the homepage claims `flight`), and each act downloads only when claimed. Three.js never enters the first load.
- **Tiers.** Tiers are decided before any 3D downloads. `poster` (reduced motion, data saver, or 2GB of memory or less) gets still artwork and no WebGL. `mid` (coarse pointer or 4GB or less) gets pixel ratio 1.5. `high` gets 2. A frame probe steps the tier down once if the median frame falls below 25fps.
- **Render on demand.** A scene draws only when its `frame` reports a change, and only while it is on screen. A still scene costs nothing.
- **The course.** Everything is cheap: one shader-painted ground mesh (distance-ramp plan textures, 2048 or 1024), one sky, instanced trees (760 or 420), flags and a few clubhouse boxes. Pixel ratio is capped at 1.5, or 1.25 on mid. The light is late-afternoon sun from the west. The course is the homepage's one immersive moment, with hole selection, reset and a 2D plan as fallback.
- **The ball.** It is photoreal: dimples baked to a normal map on the GPU, a clear coat, a gold alignment line and the club's print. It takes the light, shadow and colour grading of whichever photograph it is over, and spins by the distance it travels.

## Do's and Don'ts

### Do:
- **Do** set every new section as a full-bleed band (dark forest for tools and scenes, ivory or paper for reading) and let `band-light` or `band-paper` re-ink the working tokens.
- **Do** open each section with the fairway line (a hairline plus 3px gold) and name it for the rail, rather than labelling it.
- **Do** keep one solid primary action per band: antique on dark, forest on light, square, 48px. Pair it with an underlined text link with an arrow.
- **Do** set headings in Cormorant Garamond 300, flush left from column 3, with balanced wrapping.
- **Do** set every figure in tabular, lining Manrope, light at display sizes.
- **Do** put copy over photographs and the 3D course on a forest scrim.
- **Do** label every sample (prices, people, hours, events, itineraries) in plain small text, and leave unknown details as visible placeholders ("Address to be added").
- **Do** give every motion a still end state that reads without scripts, WebGL or motion.
- **Do** draw 3D on demand only, behind a tier check, with a poster fallback.

### Don't:
- **Don't** put kickers, eyebrows or labels above headings. Section names go to the rail; the homepage's numbered chapter index on the rule is the only index.
- **Don't** use glass, frosted blur or translucent panels as decoration.
- **Don't** build rows of equal cards, or put content in a card for its own sake. Use hairlines, the grid and photographs.
- **Don't** use antique gold for body text, large fills or a second accent role. On light grounds it is always bronze.
- **Don't** use Stone for text.
- **Don't** italicise more than the one phrase in the page's main heading.
- **Don't** round corners on buttons, panels, fields or photographs, or add shadows to surfaces.
- **Don't** use spaced capitals for labels or running text.
- **Don't** invent members, testimonials, press, partners or membership numbers.
