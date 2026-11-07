// Sample events and scores. Nobody here is real, and the dates are placeholders.

export type ClubEvent = {
  id: string;
  date: string;
  month: string;
  title: string;
  kind: "Club" | "Open" | "Company" | "Social";
  note: string;
};

export const upcomingEvents: ClubEvent[] = [
  { id: "captains-drive", date: "28", month: "Nov", title: "Captain's Drive-In", kind: "Club", note: "Shotgun start at 07:30, then lunch on the terrace." },
  { id: "club-open", date: "13", month: "Dec", title: "The Club Open", kind: "Open", note: "Two rounds, stroke play, with live scores on this page." },
  { id: "bays-final", date: "20", month: "Dec", title: "Floodlit Longest Drive", kind: "Social", note: "Eight Toptracer bays, one winner, food to the bay." },
  { id: "new-year", date: "03", month: "Jan", title: "New Year Medal", kind: "Club", note: "Handicap qualifier. Visitors welcome with a member." },
  { id: "banking-cup", date: "24", month: "Jan", title: "Banking Sector Cup", kind: "Company", note: "Corporate teams of four, with an evening clinic." },
];

export type LeaderboardRow = {
  name: string;
  /** Strokes against par. Negative is under par. */
  score: number;
  /** Holes completed in the round. */
  thru: number;
};

export const leaderboardStart: LeaderboardRow[] = [
  { name: "W. Kamau", score: -5, thru: 14 },
  { name: "A. Odhiambo", score: -4, thru: 15 },
  { name: "N. Wanjiru", score: -4, thru: 13 },
  { name: "J. Kiprono", score: -3, thru: 16 },
  { name: "S. Njeri", score: -2, thru: 14 },
  { name: "D. Mutua", score: -1, thru: 15 },
  { name: "P. Achieng", score: 0, thru: 12 },
  { name: "M. Barasa", score: 1, thru: 13 },
];

export const sponsors = ["Presenting partner", "Scoring partner", "Hospitality partner"];

// The golf day builder's price list. Sample prices, in Kenyan shillings.
export const GOLF_PER_PLAYER = 5500;

export const roomOptions = [
  { id: "none", label: "No room", note: "Straight to the first tee", price: 0 },
  { id: "half", label: "Half-day conference room", note: "Seats 40, with a screen", price: 35000 },
  { id: "full", label: "Full-day conference room", note: "Seats 40, with tea and coffee", price: 60000 },
] as const;

export const buffetOptions = [
  { id: "none", label: "No catering", note: "Pay as you go at the bar", perHead: 0 },
  { id: "nyama", label: "Nyama choma lunch", note: "From the grill, on the terrace", perHead: 2200 },
  { id: "buffet", label: "Clubhouse buffet", note: "Hot and cold, in the main room", perHead: 3000 },
  { id: "plated", label: "Plated dinner", note: "Three courses with prize-giving", perHead: 4800 },
] as const;

export const clinicOptions = [
  { id: "none", label: "No clinic", note: "Leave it at the golf", price: 0 },
  { id: "clinic", label: "Evening clinic", note: "Two hours with the club professional", price: 25000 },
  { id: "bays", label: "Clinic and floodlit bays", note: "Clinic, then Toptracer for the team", price: 55000 },
] as const;

export type GolfDay = {
  players: number;
  room: (typeof roomOptions)[number]["id"];
  buffet: (typeof buffetOptions)[number]["id"];
  clinic: (typeof clinicOptions)[number]["id"];
};

/** Each line of the quote and the total. Kept apart from the component so it can be tested. */
export function quoteGolfDay(day: GolfDay) {
  const room = roomOptions.find((option) => option.id === day.room) ?? roomOptions[0];
  const buffet = buffetOptions.find((option) => option.id === day.buffet) ?? buffetOptions[0];
  const clinic = clinicOptions.find((option) => option.id === day.clinic) ?? clinicOptions[0];

  const lines = [
    { label: `Golf for ${day.players} players`, amount: day.players * GOLF_PER_PLAYER },
    { label: room.label, amount: room.price },
    { label: buffet.label, amount: buffet.perHead * day.players },
    { label: clinic.label, amount: clinic.price },
  ].filter((line) => line.amount > 0);

  const total = lines.reduce((sum, line) => sum + line.amount, 0);
  return { lines, total, perPlayer: Math.round(total / day.players) };
}
