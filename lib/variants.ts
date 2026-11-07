import { cva } from "class-variance-authority";

export const button = cva(
  // Square-edged, Manrope semibold, as the blueprint sets its actions.
  "group inline-flex shrink-0 items-center justify-center gap-3 font-ui text-[15px] font-semibold transition-[background-color,border-color,color,transform] duration-200 ease-out active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      tone: {
        gold: "bg-gold text-reserve hover:bg-champagne",
        outline: "border border-alabaster/35 text-alabaster hover:border-gold hover:bg-gold/10",
        glass: "bg-alabaster/10 text-alabaster hover:bg-alabaster/20",
      },
      size: {
        md: "h-12 px-6",
        sm: "h-10 px-5 text-sm",
        icon: "size-12",
      },
    },
    defaultVariants: { tone: "gold", size: "md" },
  },
);

/** A choice inside a form: a pill or card that stays gold while selected. */
export const choice = cva(
  "transition-[background-color,border-color,color] duration-300 ease-fluid disabled:pointer-events-none disabled:opacity-35",
  {
    variants: {
      selected: {
        true: "border-gold bg-gold text-reserve",
        false: "border-alabaster/15 text-alabaster hover:border-gold/60",
      },
    },
    defaultVariants: { selected: false },
  },
);
