export type Tier = 'top' | 'good' | 'watch' | 'risk';

export interface MapVenue {
  name: string;
  lat: number;
  lng: number;
  score: number;
  satisfaction: number;
  tier: Tier;
  region: string;
}

export const ALL_VENUES: MapVenue[] = [
  { name: "King's Cross",  lat: 51.5351, lng: -0.1248, score: 94, satisfaction: 4.8, tier: 'top',   region: 'London'     },
  { name: 'Shoreditch',    lat: 51.5231, lng: -0.0748, score: 91, satisfaction: 4.7, tier: 'top',   region: 'London'     },
  { name: 'Liverpool St',  lat: 51.5178, lng: -0.1090, score: 83, satisfaction: 4.4, tier: 'good',  region: 'London'     },
  { name: 'Manchester',    lat: 53.4836, lng: -2.2493, score: 82, satisfaction: 4.4, tier: 'good',  region: 'Manchester' },
  { name: 'Kensington',    lat: 51.4988, lng: -0.1943, score: 80, satisfaction: 4.3, tier: 'good',  region: 'London'     },
  { name: 'Edinburgh',     lat: 55.9528, lng: -3.1872, score: 79, satisfaction: 4.3, tier: 'good',  region: 'Edinburgh'  },
  { name: 'Battersea',     lat: 51.4835, lng: -0.1440, score: 78, satisfaction: 4.2, tier: 'good',  region: 'London'     },
  { name: 'Bristol',       lat: 51.4545, lng: -2.5879, score: 77, satisfaction: 4.2, tier: 'good',  region: 'Bristol'    },
  { name: 'Birmingham',    lat: 52.4796, lng: -1.9026, score: 74, satisfaction: 4.2, tier: 'watch', region: 'Birmingham' },
  { name: 'Carnaby',       lat: 51.5131, lng: -0.1385, score: 71, satisfaction: 4.1, tier: 'watch', region: 'London'     },
  { name: 'Covent Garden', lat: 51.5131, lng: -0.1260, score: 65, satisfaction: 4.0, tier: 'risk',  region: 'London'     },
];

export const TIER_STYLE: Record<Tier, {
  bg: string; text: string;
  bgPastel: string; textPastel: string;
  label: string; pulse?: boolean;
}> = {
  top:   { bg: '#2E7D52', text: '#FFFFFF', bgPastel: '#C5E8D7', textPastel: '#1A5433', label: 'Top performer' },
  good:  { bg: '#3B72C0', text: '#FFFFFF', bgPastel: '#C8D9F5', textPastel: '#1E3D73', label: 'On target' },
  watch: { bg: '#F0B680', text: '#72430B', bgPastel: '#FAE6CC', textPastel: '#72430B', label: 'Needs attention' },
  risk:  { bg: '#E77171', text: '#6F0C23', bgPastel: '#FAD5D5', textPastel: '#6F0C23', label: 'At risk', pulse: true },
};
