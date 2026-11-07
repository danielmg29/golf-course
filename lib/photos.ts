// Every photo on the site, in one place, so real club photography can replace these one
// line at a time. These are stock placeholders from Unsplash, used under the Unsplash
// License and served from Unsplash's CDN. None of them shows the real club.
const unsplash = (id: string) => `https://images.unsplash.com/photo-${id}`;

export const photos = {
  // The course
  sunriseGreen: {
    src: unsplash("1709525617656-5498eefc7d03"),
    alt: "Low sun over a green, with long shadows and a line of trees behind it",
  },
  aerialHills: {
    src: unsplash("1605147861225-7bcd55f8e513"),
    alt: "Fairways winding through wooded hills, seen from the air",
  },
  aerialBunkers: {
    src: unsplash("1500932334442-8761ee4810a7"),
    alt: "Bunkers and long tree shadows on a fairway, seen from directly above",
  },
  aerialLake: {
    src: unsplash("1742498626135-67a7d3501eff"),
    alt: "A lake and white bunkers beside a curving cart path, seen from the air",
  },
  duskTrees: {
    src: unsplash("1716464968470-c2162dd998e4"),
    alt: "Trees in silhouette against a low sun at the edge of a fairway",
  },
  sandBunker: {
    src: unsplash("1538648759472-7251f7cb2c2f"),
    alt: "A sweeping sand bunker below a raised green at dusk",
  },
  pondFairway: {
    src: unsplash("1592937238247-cd0090e02f65"),
    alt: "A small pond and bunkers in a wide fairway, with hills on the horizon",
  },
  clubhouseGreen: {
    src: unsplash("1758190153295-710199944b73"),
    alt: "A wide green fairway and pond, with a clubhouse among the trees behind",
  },
  rollingHills: {
    src: unsplash("1761185259325-d1aaac14308a"),
    alt: "Rolling fairways under a pale sky, with a band of trees in the distance",
  },
  mistFlag: {
    src: unsplash("1517074009205-d9ca5d8b4a63"),
    alt: "A flag on a green in early morning mist",
  },
  sunFlag: {
    src: unsplash("1609319795593-3339d3583c0c"),
    alt: "A flag on a green with the sun setting through the trees",
  },
  ballOnGreen: {
    src: unsplash("1632946269126-0f8edbe8b068"),
    alt: "A golf ball on short grass, with a flag and trees behind it",
  },
  ballOnTee: {
    src: unsplash("1562204320-31975a5e09ce"),
    alt: "A close view of a golf ball on a wooden tee",
  },

  // Golfers
  swingLowSun: {
    src: unsplash("1696104470342-b1ed3afe8381"),
    alt: "A golfer finishing a swing in low golden light",
  },
  longShadows: {
    src: unsplash("1593282153762-a41e3cceb06c"),
    alt: "Two golfers on a fairway with long shadows stretching towards the camera",
  },
  silhouette: {
    src: unsplash("1505794718076-13e166c01a33"),
    alt: "A golfer in silhouette against an orange sunset",
  },
  golferPolo: {
    src: unsplash("1649001711297-64313ea5155a"),
    alt: "A golfer in a white polo shirt, looking down the fairway",
  },
  duskWalk: {
    src: unsplash("1629928515074-0a76b71e9954"),
    alt: "Two people walking on a dark fairway under a storm-lit evening sky",
  },
  toast: {
    src: unsplash("1629673120178-53a664eec9e8"),
    alt: "Three golfers raising a drink together on a sunny fairway",
  },
  galleryCrowd: {
    src: unsplash("1766206096984-5b13b0f1eedd"),
    alt: "Spectators watching a golfer play at a tournament",
  },

  // The club
  pool: {
    src: unsplash("1619329268107-5aba62ca4528"),
    alt: "A swimming pool among palm trees at sunset, with water beyond",
  },
  poolDusk: {
    src: unsplash("1781039869379-5561fe260d26"),
    alt: "A pool and thatched building lit up at dusk",
  },
  terrace: {
    src: unsplash("1766832255363-c9f060ade8b0"),
    alt: "Dining tables laid with white cloths in a warm, wood-lined room",
  },
  gym: {
    src: unsplash("1593079831268-3381b0db4a77"),
    alt: "A row of treadmills on a wooden floor in a green-walled gym",
  },
  tennis: {
    src: unsplash("1499510318569-1a3d67dc3976"),
    alt: "A tennis court surrounded by trees, seen from directly above",
  },
  bays: {
    src: unsplash("1775144581077-ef2b00f156e7"),
    alt: "A golfer in silhouette finishing a swing, looking out from a driving bay over the range",
  },
  lounge: {
    src: unsplash("1761971975410-f8dd32d7fbdd"),
    alt: "A seating area with floor-to-ceiling windows looking out on trees",
  },

  // Events
  banquet: {
    src: unsplash("1762765684665-6b6855bb6fe6"),
    alt: "Long tables set for a banquet in a grand hall with a glass roof",
  },
  gala: {
    src: unsplash("1769812343285-ec0775437680"),
    alt: "Tables with tall white flower arrangements set for a formal evening",
  },

  // Stay & Play
  lodge: {
    src: unsplash("1779216175784-a67b6da108bb"),
    alt: "An open-air lodge under a high thatched roof",
  },
  lodgeRoom: {
    src: unsplash("1611892440504-42a792e24d32"),
    alt: "A hotel bedroom with a wooden bed and a private terrace",
  },
  giraffe: {
    src: unsplash("1523805009345-7448845a9e53"),
    alt: "A giraffe behind a flat-topped acacia tree in golden light",
  },
  safariSunset: {
    src: unsplash("1516426122078-c23e76319801"),
    alt: "A safari vehicle crossing the plains at sunset",
  },
  balloon: {
    src: unsplash("1519659528534-7fd733a832a0"),
    alt: "A hot air balloon drifting over zebras on the savannah",
  },
} as const;

export type PhotoName = keyof typeof photos;
