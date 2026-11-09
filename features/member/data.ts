// Sample people and games. Everyone here is invented.

export const sectors = ["All", "Legal", "Finance", "Tech", "Agri", "Property", "Health"] as const;
export type Sector = (typeof sectors)[number];

export type Member = {
  name: string;
  title: string;
  company: string;
  sector: Exclude<Sector, "All">;
};

export const members: Member[] = [
  { name: "Amina Hassan", title: "Partner", company: "Hassan & Mbugua Advocates", sector: "Legal" },
  { name: "Brian Otieno", title: "Head of Treasury", company: "Lakeland Bank", sector: "Finance" },
  { name: "Carol Wambui", title: "Chief Technology Officer", company: "Pesaflow Labs", sector: "Tech" },
  { name: "David Kipchumba", title: "Managing Director", company: "Rift Valley Avocados", sector: "Agri" },
  { name: "Esther Muthoni", title: "Founder", company: "Muthoni Property Group", sector: "Property" },
  { name: "Felix Ouma", title: "Consultant Surgeon", company: "Highridge Hospital", sector: "Health" },
  { name: "Grace Akinyi", title: "Investment Director", company: "Savannah Capital", sector: "Finance" },
  { name: "Hamisi Juma", title: "Head of Engineering", company: "Silicon Savannah Cloud", sector: "Tech" },
  { name: "Irene Chebet", title: "Export Manager", company: "Kericho Tea Growers", sector: "Agri" },
  { name: "James Maina", title: "Senior Counsel", company: "Maina Legal", sector: "Legal" },
  { name: "Lilian Nekesa", title: "Development Director", company: "Greenpark Estates", sector: "Property" },
  { name: "Moses Kariuki", title: "Medical Director", company: "Kariuki Clinics", sector: "Health" },
];

export const handicapBands = ["Any", "0 to 12", "13 to 24", "25+"] as const;
export type HandicapBand = (typeof handicapBands)[number];

export type OpenGame = {
  id: string;
  when: string;
  period: "Morning" | "Afternoon";
  band: Exclude<HandicapBand, "Any">;
  players: string[];
  note: string;
};

export const openGames: OpenGame[] = [
  { id: "sat-0740", when: "Sat 07:40", period: "Morning", band: "13 to 24", players: ["Brian O.", "Grace A."], note: "Friendly match, walking with caddies." },
  { id: "sat-0830", when: "Sat 08:30", period: "Morning", band: "0 to 12", players: ["James M.", "Hamisi J.", "Felix O."], note: "Playing for the card, so bring your A game." },
  { id: "sun-0700", when: "Sun 07:00", period: "Morning", band: "25+", players: ["Irene C."], note: "New to the game. Everyone welcome." },
  { id: "wed-1400", when: "Wed 14:00", period: "Afternoon", band: "13 to 24", players: ["Carol W.", "Moses K."], note: "Nine holes, then the terrace." },
  { id: "thu-1530", when: "Thu 15:30", period: "Afternoon", band: "25+", players: ["David K.", "Esther M.", "Lilian N."], note: "Visiting golfers especially welcome." },
  { id: "fri-1500", when: "Fri 15:00", period: "Afternoon", band: "0 to 12", players: ["Amina H."], note: "Quick round before the weekend." },
];
