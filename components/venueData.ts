export type Tier     = 'top' | 'good' | 'watch' | 'risk';
export type TrendDir = 'up' | 'flat' | 'down';

export interface Creator {
  name: string;
  lat: number;
  lng: number;
  score: number;
  satisfaction: number; // engagement rate %
  tier: Tier;
  region: string; // platform: YouTube, Podcast, Newsletter
  trend: TrendDir;
  vsAvg: string;
  weeklyDelta: number;
}

// Keep MapVenue as alias for backward compat with VenueMap
export type MapVenue = Creator;

export const ALL_VENUES: Creator[] = [
  { name: 'TechTalk Daily',   lat:  51.5079, lng:   -0.1280, score: 94, satisfaction: 8.2, tier: 'top',   region: 'YouTube',    trend: 'up',   vsAvg: '+14%', weeklyDelta:  2 },
  { name: 'Pod & Chill',      lat:  40.7128, lng:  -74.0060, score: 91, satisfaction: 7.8, tier: 'top',   region: 'Podcast',    trend: 'up',   vsAvg: '+11%', weeklyDelta:  0 },
  { name: 'Creative Brief',   lat:  51.5131, lng:   -0.0901, score: 83, satisfaction: 6.4, tier: 'good',  region: 'Newsletter', trend: 'flat', vsAvg:  '+3%', weeklyDelta:  1 },
  { name: 'Everyday Finance', lat:  41.8781, lng:  -87.6298, score: 82, satisfaction: 6.2, tier: 'good',  region: 'YouTube',    trend: 'up',   vsAvg:  '+2%', weeklyDelta:  8 },
  { name: 'Morning Mindset',  lat:  55.9533, lng:   -3.1883, score: 79, satisfaction: 6.0, tier: 'good',  region: 'Podcast',    trend: 'flat', vsAvg:  '-1%', weeklyDelta:  5 },
  { name: 'Sarah Codes',      lat:  37.7749, lng: -122.4194, score: 78, satisfaction: 6.8, tier: 'good',  region: 'YouTube',    trend: 'up',   vsAvg:  '+2%', weeklyDelta:  3 },
  { name: 'Pixel Perfect',    lat:  30.2672, lng:  -97.7431, score: 78, satisfaction: 5.9, tier: 'good',  region: 'YouTube',    trend: 'down', vsAvg:  '-2%', weeklyDelta: -1 },
  { name: 'The Hustle Recap', lat:  25.7617, lng:  -80.1918, score: 77, satisfaction: 5.8, tier: 'good',  region: 'Newsletter', trend: 'flat', vsAvg:  '-3%', weeklyDelta:  2 },
  { name: 'GameStream Live',  lat:  43.6532, lng:  -79.3832, score: 74, satisfaction: 5.1, tier: 'watch', region: 'YouTube',    trend: 'down', vsAvg:  '-8%', weeklyDelta: -5 },
  { name: 'Vlog Universe',    lat:  48.8566, lng:    2.3522, score: 71, satisfaction: 4.8, tier: 'watch', region: 'YouTube',    trend: 'down', vsAvg: '-12%', weeklyDelta: -7 },
  { name: 'ByteSize News',    lat: -33.8688, lng:  151.2093, score: 65, satisfaction: 4.2, tier: 'risk',  region: 'YouTube',    trend: 'down', vsAvg: '-19%', weeklyDelta: -4 },
];

export const TIER_STYLE: Record<Tier, {
  bg: string; text: string;
  bgPastel: string; textPastel: string;
  label: string; pulse?: boolean;
}> = {
  top:   { bg: '#1A5C3A', text: '#FFFFFF', bgPastel: '#C8EDD8', textPastel: '#1A5C3A', label: 'Top performer' },
  good:  { bg: '#3B72C0', text: '#FFFFFF', bgPastel: '#C8D9F5', textPastel: '#1E3D73', label: 'On target' },
  watch: { bg: '#F07830', text: '#FFFFFF', bgPastel: '#FCE8D0', textPastel: '#7A4808', label: 'Needs attention' },
  risk:  { bg: '#E84030', text: '#FFFFFF', bgPastel: '#FCE0DA', textPastel: '#8C1808', label: 'At risk', pulse: true },
};
